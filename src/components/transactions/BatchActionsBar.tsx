
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Flag, Tag, Trash, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DbCategory } from '@/types/database.types';

interface BatchActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onCategorize: (categoryId: string | null) => void;
  categories: DbCategory[];
  onClearSelection?: () => void;
}

const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedCount,
  onDelete,
  onCategorize,
  categories,
  onClearSelection,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategorize(value || null);
  };

  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between bg-spendwise-oxford text-white p-3 rounded-md">
        <div className="flex items-center">
          <span className="mr-4 font-medium">{selectedCount} selected</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={handleClearSelection}
          >
            <X size={16} className="mr-1" /> Clear
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="w-48">
            <Select onValueChange={handleCategoryChange} value={selectedCategory}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Assign Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.category_id} value={category.category_id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash size={16} className="mr-1" /> Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Transactions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} transactions? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchActionsBar;
