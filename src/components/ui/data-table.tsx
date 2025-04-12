
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';

interface DataTableProps {
  data: any[];
  onSortChange?: (column: string, order: 'asc' | 'desc') => void;
  selectedItems?: string[];
  onSelectedItemsChange?: (items: string[]) => void;
  onFlagChange?: (id: string, isFlagged: boolean) => void;
  onDeleteItem?: (id: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange?: (size: number) => void;
    totalItems: number;
  };
}

export function DataTable({
  data = [],
  onSortChange,
  selectedItems = [],
  onSelectedItemsChange,
  onFlagChange,
  onDeleteItem,
  pagination,
}: DataTableProps) {
  const handleSort = (column: string) => {
    if (!onSortChange) return;
    const currentOrder = column === 'date' ? 'desc' : 'asc';
    onSortChange(column, currentOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (!onSelectedItemsChange) return;
    
    if (checked) {
      onSelectedItemsChange([...selectedItems, id]);
    } else {
      onSelectedItemsChange(selectedItems.filter(item => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectedItemsChange) return;
    
    if (checked) {
      onSelectedItemsChange(data.map(item => item.id));
    } else {
      onSelectedItemsChange([]);
    }
  };

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  // Extract columns from first data item
  const columns = Object.keys(data[0]).filter(col => col !== 'id' && col !== 'rawData');

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectedItemsChange && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={data.length > 0 && selectedItems.length === data.length}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead 
                  key={col} 
                  className={col === 'amount' ? 'text-right' : ''}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center space-x-1 cursor-pointer">
                    <span>{col.charAt(0).toUpperCase() + col.slice(1)}</span>
                    {onSortChange && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {onSelectedItemsChange && (
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(row.id)}
                      onCheckedChange={(checked) => handleSelectItem(row.id, !!checked)}
                      aria-label={`Select ${row.description || row.id}`}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell 
                    key={`${row.id}-${col}`}
                    className={col === 'amount' ? 'text-right' : ''}
                  >
                    {row[col]}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onFlagChange && (
                        <DropdownMenuItem
                          onClick={() => onFlagChange(row.id, !row.isFlagged)}
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          {row.isFlagged ? 'Remove flag' : 'Flag transaction'}
                        </DropdownMenuItem>
                      )}
                      {onDeleteItem && (
                        <>
                          {onFlagChange && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDeleteItem(row.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
