import Pagination from './pagination';

export function DowTable(props) {
  const {
    headers,
    totalElements,
    setCurrentPage
  } = props;
  return (
    <div className='py-2 mx-auto w-8/12 sm:px-6 lg:px-8'>
      <div className='drop-shadow-xl sm:rounded-lg'>
        <table className='table w-full'>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`${header}_${index}`}
                  scope='col'
                  className='uppercase tracking-wider'
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className=''>{props.children}</tbody>
        </table>
      </div>
      {totalElements ? <Pagination setCurrentPage={setCurrentPage} totalElements={totalElements} /> : null}
    </div>
  );
}

export function DefaultField(props) {
  const { className } = props;

  return <td className={`${className} whitespace-nowrap`}>{props.children}</td>;
}
