import React from 'react';
import { SortConfig } from '../types';
import { SortIcon } from './icons';

interface SortableTableHeaderProps<T> {
  label: string;
  sortKey: keyof T;
  sortConfig: SortConfig;
  onSort: (key: keyof T) => void;
}

const SortableTableHeader = <T,>({ label, sortKey, sortConfig, onSort }: SortableTableHeaderProps<T>) => {
  const isSorted = sortConfig.key === sortKey;
  const iconClass = `w-4 h-4 ml-2 transition-opacity ${isSorted ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`;
  const directionClass = isSorted && sortConfig.direction === 'descending' ? 'rotate-180' : '';

  return (
    <th scope="col" className="px-6 py-3">
      <button onClick={() => onSort(sortKey)} className="flex items-center group focus:outline-none">
        <span>{label}</span>
        <div className={`${directionClass}`}>
            <SortIcon className={iconClass} />
        </div>
      </button>
    </th>
  );
};

export default SortableTableHeader;
