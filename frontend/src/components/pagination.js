import { useState, useEffect } from 'react';
export default function Pagination({
  totalElements,
  setCurrentPage = () => null,
}
) {
  const [page, setPage] = useState(1);
  const offset = +page === 1 ? 0 : (+page - 1) * 25;

  useEffect(() => setCurrentPage(page), [setCurrentPage, page]);

  return (
    <div className=''>
      <div className='px-6 py-3 text-gray-500 font-medium text-xs text-left tracking-wider'>
        <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm'>
              Showing <span className='font-medium'>{offset + 1}</span> to{' '}
              <span className='font-medium'>{offset + 25}</span> of{' '}
              <span className='font-medium'>{totalElements}</span> results
            </p>
          </div>
          <div>
            <nav
              className='relative z-0 flex rounded-md shadow-sm justify-between'
              aria-label='Pagination'
            >
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ml-4'
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
