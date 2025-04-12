
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FlagIcon, Pencil, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps {
  data: any[];
  onSortChange?: (column: string, order: 'asc' | 'desc') => void;
  selectedItems?: string[];
  onSelectedItemsChange?: (selectedIds: string[]) => void;
  onFlagChange?: (id: string, isFlagged: boolean) => void;
  onDeleteItem?: (id: string) => void;
  onEditItem?: (id: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    totalItems?: number;
  };
}

export function DataTable({
  data,
  onSortChange,
  selectedItems = [],
  onSelectedItemsChange,
  onFlagChange,
  onDeleteItem,
  onEditItem,
  pagination,
}: DataTableProps) {
  const columns = data.length > 0 ? Object.keys(data[0]).filter(col => col !== 'id' && col !== 'rawData') : [];
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectedItemsChange) return;
    
    if (checked) {
      onSelectedItemsChange(data.map(item => item.id));
    } else {
      onSelectedItemsChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectedItemsChange) return;
    
    if (checked) {
      onSelectedItemsChange([...selectedItems, id]);
    } else {
      onSelectedItemsChange(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const handleSort = (column: string) => {
    if (!onSortChange) return;
    
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newOrder);
    onSortChange(column, newOrder);
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectedItemsChange && (
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedItems.length === data.length && data.length > 0} 
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all" 
                  />
                </TableHead>
              )}
              
              {columns.map((column) => (
                <TableHead 
                  key={column} 
                  className={onSortChange ? "cursor-pointer" : ""}
                  onClick={() => onSortChange && handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                    {sortColumn === column && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              
              {(onDeleteItem || onEditItem || onFlagChange) && (
                <TableHead className="w-24 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row) => (
                <TableRow key={row.id}>
                  {onSelectedItemsChange && (
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(row.id)} 
                        onCheckedChange={(checked) => handleSelectRow(row.id, !!checked)}
                        aria-label={`Select row ${row.id}`} 
                      />
                    </TableCell>
                  )}
                  
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column}`}>{row[column]}</TableCell>
                  ))}
                  
                  {(onDeleteItem || onEditItem || onFlagChange) && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onFlagChange && (
                            <DropdownMenuItem onClick={() => onFlagChange(row.id, !row.isFlagged)}>
                              <FlagIcon className="mr-2 h-4 w-4" />
                              {row.isFlagged ? 'Remove flag' : 'Flag item'}
                            </DropdownMenuItem>
                          )}
                          
                          {onEditItem && (
                            <DropdownMenuItem onClick={() => onEditItem(row.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          
                          {onDeleteItem && (
                            <DropdownMenuItem onClick={() => onDeleteItem(row.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onSelectedItemsChange ? 1 : 0) + ((onDeleteItem || onEditItem || onFlagChange) ? 1 : 0)} 
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {pagination.totalItems !== undefined && (
              <>Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} entries</>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {pagination.onPageSizeChange && (
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(value) => pagination.onPageSizeChange?.(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 25, 50, 100].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
