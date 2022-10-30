fn main() {
    /*
    let libs = &[(Some("../libs/foo/1.0/"), "static=foo"), // use ../libs/foo/1.0/libfoo.a
        (None, "bar")]; // use libbar.so using LD_LIBRARY_PATH
    for &(ref m_path, ref lib) in libs {
        if let &Some(static_path) = m_path {
            println!("cargo:rustc-link-search={}", &static_path);
        }
        println!("cargo:rustc-link-lib={}", &lib);
    }
    */
    //println!("cargo:rustc-link-search={}", &static_path);
    //println!("cargo:rustc-link-lib=rbf2json");
    println!("cargo:rustc-link-lib=jansson");
}
