import React from 'react';
import {
  TableRow,
  TableCell,
  Skeleton,
  Box
} from '@mui/material';

interface TableSkeletonLoaderProps {
  rows: number;
  columns: number;
  showCheckbox?: boolean;
}

export function TableSkeletonLoader({ rows, columns, showCheckbox = false }: TableSkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {showCheckbox && (
            <TableCell padding="checkbox">
              <Skeleton variant="rectangular" width={20} height={20} />
            </TableCell>
          )}
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton 
                  variant="text" 
                  width={Math.random() * 100 + 50} 
                  height={20} 
                />
                {colIndex === 0 && (
                  <Skeleton variant="rectangular" width={60} height={24} />
                )}
              </Box>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default TableSkeletonLoader;
