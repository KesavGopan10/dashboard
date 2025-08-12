import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-2 py-4 space-y-4 sm:space-y-0">
        <p className="text-sm text-gray-600 hidden sm:block">
            Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-semibold">{totalCount}</span> results
        </p>
        <div className="flex items-center space-x-2">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-sm text-gray-700 px-2 font-medium">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    </div>
  );
};

export default Pagination;