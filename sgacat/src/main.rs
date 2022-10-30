extern crate byteorder;
extern crate flate2;
extern crate libc;

use std::env;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use std::io::{self, Read, Seek, SeekFrom, Error, ErrorKind};

use byteorder::{ReadBytesExt, LittleEndian};
use flate2::bufread::ZlibDecoder;

use std::process::{Command, Stdio};

use libc::c_char;
use std::ffi::CStr;

#[derive(Default,Debug)]
struct SgaHeader {
    version_major: u16,
    version_minor: u16,
    /*
    archive_name: [u8; 128],
    header_md5: [u8; 16],
    content_md5: [u8; 16],
    */
    data_hdr_size: u32,
    data_hdr_offset: u32,
    data_offset: u32,
    platform: u32,
    entry_offset: u32,
    entry_count: u16,
    directory_offset: u32,
    directory_count: u16,
    file_offset: u32,
    file_count: u16,
    string_offset: u32,
    string_count: u16,

    entry_points: Vec<DirInfo>,
    directories: Vec<DirInfo>,
    files: Vec<FileInfo>,
    strings: Vec<u8>,
}

#[derive(Default,Debug,Clone)]
pub struct DirInfo {
    name: String,
    path: String,

    first_directory: u16,
    last_directory: u16,

    first_file: u16,
    last_file: u16,
}

#[derive(Default,Debug,Clone)]
pub struct FileInfo {
    name_offset: u32,
    data_offset: u32,
    data_len_compressed: u32,
    data_len: u32,
    mod_time: u32,
}

#[derive(Default,Debug)]
pub struct EntryPoint {
    name: String,
    alias: String,
    first_directory: u16,
    last_directory: u16,
    first_file: u16,
    last_file: u16,
    folder_offset: u16,
}

#[derive(Debug)]
pub enum SgaPath {
    Directory(DirInfo),
    File(FileInfo),
}

fn open_sga(path: &Path) -> Result<File, io::Error> {
    let mut file = File::open(path)?;
    let mut buf = [0; 8];

    file.read(&mut buf)?;

    if buf[0..8].eq(b"_ARCHIVE") {
        Ok(file)
    } else {
        Err(Error::new(ErrorKind::InvalidData, "invalid sga file"))
    }
}

#[link(name = "rbf2json")]
extern {
    fn open_rbf(buf: *const u8) -> *const c_char;
}

fn read_header(f: &mut File) -> Result<SgaHeader, io::Error> {
    let mut sga = SgaHeader { ..Default::default() };
    let mut name = [0u8; 128];
    let mut hdr_md5 = [0u8; 16];
    let mut content_md5 = [0u8; 16];

    sga.version_major = f.read_u16::<LittleEndian>()?;
    sga.version_minor = f.read_u16::<LittleEndian>()?;

    f.read_exact(&mut hdr_md5);
    f.read_exact(&mut name);
    f.read_exact(&mut content_md5);

    sga.data_hdr_size = f.read_u32::<LittleEndian>()?;
    sga.data_offset = f.read_u32::<LittleEndian>()?;
    sga.data_hdr_offset = f.read_u32::<LittleEndian>()?;
    sga.platform = f.read_u32::<LittleEndian>()?;

    f.seek(SeekFrom::Start(sga.data_hdr_offset as u64))?;

    sga.entry_offset = f.read_u32::<LittleEndian>()?;
    sga.entry_count = f.read_u16::<LittleEndian>()?;
    sga.directory_offset = f.read_u32::<LittleEndian>()?;
    sga.directory_count = f.read_u16::<LittleEndian>()?;
    sga.file_offset = f.read_u32::<LittleEndian>()?;
    sga.file_count = f.read_u16::<LittleEndian>()?;
    sga.string_offset = f.read_u32::<LittleEndian>()?;
    sga.string_count = f.read_u16::<LittleEndian>()?;

    Ok(sga)
}

fn load_entries(f: &mut File, sga: &mut SgaHeader) -> Result<u32, io::Error> {
    let entry_offset = sga.data_hdr_offset + sga.entry_offset;
    f.seek(SeekFrom::Start(entry_offset as u64))?;

    for i in 0..sga.entry_count {
        let mut buf = vec![0; 64];
        f.read_exact(&mut buf);
        let name = String::from_utf8(buf).unwrap_or("".to_string()).trim_matches('\0').to_string();
        let mut buf = vec![0; 64];
        f.read_exact(&mut buf);
        let alias = String::from_utf8(buf).unwrap_or("".to_string());
        let first_dir = f.read_u16::<LittleEndian>()?;
        let last_dir = f.read_u16::<LittleEndian>()?;
        let first_file = f.read_u16::<LittleEndian>()?;
        let last_file = f.read_u16::<LittleEndian>()?;
        let folder_offset = f.read_u16::<LittleEndian>()?;
        let path = format!("{}\\", name);

        sga.entry_points.push(DirInfo {
            name: name,
            path: path,
            first_directory: first_dir,
            last_directory: last_dir,
            first_file: first_file,
            last_file: last_file,
        });
    }

    Ok(0)
}

fn get_directory_entry_point(sga: &SgaHeader, idx: u16) -> String {
    for ep in sga.entry_points.iter() {
        if ep.first_directory <= idx && ep.last_directory > idx {
            return ep.path.clone()
        }
    }

    sga.entry_points[0].path.clone()

}

fn read_from_strblock(sga: &SgaHeader, index: u32) -> String {
    let mut i = index as usize;
    let mut res = String::new();
    loop {
        let c = sga.strings[i as usize] as char;
        if c == '\0' {
            break;
        }
        res.push(c);
        i += 1;
    }

    res
}

fn load_directories(f: &mut File, sga: &mut SgaHeader) -> Result<u32, io::Error> {
    let dir_offset = sga.data_hdr_offset + sga.directory_offset;
    f.seek(SeekFrom::Start(dir_offset as u64))?;

    for i in 0..sga.directory_count {
        let name_offset = f.read_u32::<LittleEndian>()?;
        let mut name = String::new();
        let mut path = String::new();
        let mut tmp_path = read_from_strblock(&sga, name_offset);
        let entry_point = get_directory_entry_point(&sga, i);

        if tmp_path.is_empty() {
            path = entry_point;
            name = path.trim_right_matches('/').to_string();
        } else {
            // afterlast /
            if let Some(i) = tmp_path.rfind('\\') {
                let (r, s) = tmp_path.split_at((i+1) as usize);
                name = s.to_string();
                path = format!("{}\\", tmp_path);
            }
            else {
                name = tmp_path.clone();
            }
            path = format!("{}\\", tmp_path);
        }

        let first_dir = f.read_u16::<LittleEndian>()?;
        let last_dir = f.read_u16::<LittleEndian>()?;
        let first_file = f.read_u16::<LittleEndian>()?;
        let last_file = f.read_u16::<LittleEndian>()?;

        sga.directories.push(DirInfo {
            name: name,
            path: path,
            first_directory: first_dir,
            last_directory: last_dir,
            first_file: first_file,
            last_file: last_file,
        });
    }

    Ok(0)
}

fn load_files(f: &mut File, sga: &mut SgaHeader) -> Result<u32, io::Error> {
    let file_offset = sga.data_hdr_offset + sga.file_offset;
    f.seek(SeekFrom::Start(file_offset as u64))?;

    for i in 0..sga.file_count {
        let name_offset = f.read_u32::<LittleEndian>()?;
        let data_offset = f.read_u32::<LittleEndian>()?;
        let len_packed =  f.read_u32::<LittleEndian>()?;
        let len = f.read_u32::<LittleEndian>()?;
        let mod_time = f.read_u32::<LittleEndian>()?;
        let flags = f.read_u16::<LittleEndian>()?;

        sga.files.push(FileInfo {
            name_offset: name_offset,
            data_offset: data_offset,
            data_len_compressed: len_packed,
            data_len: len,
            mod_time: mod_time,
        });

        let s = read_from_strblock(&sga, name_offset);
    }

    Ok(0)
}

fn resolve_path(sga: &SgaHeader, path: String) -> Option<SgaPath> {
    let mut part = String::new();
    let mut remain = String::new();

    if let Some(i) = path.find('\\') {
        let (l, r) = path.split_at((i) as usize);
        part = l.to_string();
        remain = r.trim_left_matches('\\').to_string();
    } else {
        part = path;
    }

    let mut current = DirInfo { ..Default::default() };
    for entry in sga.entry_points.iter() {
        if part.to_lowercase() == entry.name.to_lowercase() {
            current = entry.clone();
            break;
        }
    }

    if current.path.is_empty() {
        current = sga.entry_points[0].clone();
    }

    if remain.is_empty() {
        return Some(SgaPath::Directory(current))
    }

    loop {
        //println!("current dir: {:?}", current);
        if remain.is_empty() {
            break;
        }

        let tmp = remain.clone();
        if let Some(i) = tmp.find('\\') {
            let (l, r) = tmp.split_at((i) as usize);
            part = l.to_string();
            remain = r.trim_left_matches('\\').to_string();
        } else {
            part = remain;
            break;
        }
        for i in current.first_directory..current.last_directory {
            let dir = &sga.directories[i as usize];
            if part.to_lowercase() == *dir.name.to_lowercase() {
                current = dir.clone();
                break;
            }
        }
    }

    for i in current.first_file..current.last_file {
        let file = &sga.files[i as usize];
        let name = read_from_strblock(&sga, file.name_offset);
        //println!("file {}: {:?}", name, *file);
        if part.to_lowercase() == name.to_lowercase() {
            return Some(SgaPath::File(file.clone()))
        }

    }
    // else directory
    for i in current.first_directory..current.last_directory {
        let dir = &sga.directories[i as usize];
        if part.to_lowercase() == *dir.name.to_lowercase() {
            return Some(SgaPath::Directory(dir.clone()))
        }
    }

    None

}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() > 2 {
        //println!("{}\n{}", args[1], args[2]);
    //if let Some(arg) = env::args().nth(1) {
        let path = Path::new(&args[1]);
        let mut file = match open_sga(&path) {
            Ok(r) => r,
            Err(e) => {
                println!("error: {}", e);
                std::process::exit(1);
            }
        };

        let mut sga = read_header(&mut file).expect("invalid sga file");
        let string_offset = sga.data_hdr_offset + sga.string_offset;
        file.seek(SeekFrom::Start(string_offset as u64));
        //println!("name: {:?}", std::str::from_utf8(&name).unwrap()); 

        let mut strblob = vec![0; string_offset as usize];
        file.read_exact(&mut strblob);
        sga.strings = strblob;

        // load entries
        load_entries(&mut file, &mut sga).expect("unable to load sga entries");
        load_directories(&mut file, &mut sga).expect("unable to load sga entries");
        load_files(&mut file, &mut sga).expect("unable to load sga entries");
        for e in sga.entry_points.iter() {
            for i in e.first_directory..e.last_directory {
                let dir = &sga.directories[i as usize];
                for f in dir.first_file..dir.last_file {
                    let file = &sga.files[f as usize];
                    let s = read_from_strblock(&sga, file.name_offset);
                }
            }
        }

        let sga_path = str::replace(&args[2], "/", "\\");
        let f = match resolve_path(&sga, sga_path) {
            //Some(c@ SgaPath::Directory(DirInfo { .. })) => c,
            Some(SgaPath::File(c@ FileInfo { .. })) => c,
            _ => { return },
        };

        file.seek(SeekFrom::Start((sga.data_offset + f.data_offset) as u64));
        let mut bytes = vec![0u8; f.data_len_compressed as usize];
        if let Err(_) = file.read_exact(&mut bytes) {
            println!("failed to read file data");
            return
        }

        let mut deflater = ZlibDecoder::new(&bytes[..]);
        let mut out = Vec::with_capacity(f.data_len as usize);
        if let Err(e) = deflater.read_to_end(&mut out) {
            //Ok(r) => (), //println!("{:?} len: {}", r, out.len()),
            panic!("error decompressing file: {}", e);
        }

        /*
        let process = match Command::new("rbf2json")
                                    .stdin(Stdio::piped())
                                    .stdout(Stdio::piped())
                                    .spawn() {
            Err(_) => panic!("couldn't spawn rbf2json"),
            Ok(process) => process,
        };

        match process.stdin.unwrap().write_all(&out) {
            Err(_) => panic!("couldn't write to rbf2json stdin"),
            Ok(_) => (), //println!("sent data to rbf2json"),
        }

        let mut s = String::new();
        match process.stdout.unwrap().read_to_string(&mut s) {
            Err(_) => panic!("couldn't read rbf2json stdout"),
            Ok(_) => print!("{}", s),
        } 
        */

        let s = unsafe {
            let cs = open_rbf(out.as_ptr());
            CStr::from_ptr(cs).to_string_lossy().into_owned()
        };

        println!("{}", s);
        
    } else {
        println!("usage: sgareader <input.sga>");
    }
}

