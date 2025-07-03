"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Category, StockItem } from "@/types";

interface CategoriesTabProps {
  categories: Category[];
  stockItems: StockItem[];
  onCategoryCreate: (category: Omit<Category, "id" | "created_at" | "updated_at">) => void;
  onCategoryUpdate: (id: string, category: Partial<Category>) => void;
  onCategoryDelete: (id: string) => void;
}

const colors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function CategoriesTab({
  categories,
  stockItems,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
}: CategoriesTabProps) {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: colors[0],
  });

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Category Name Required",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("CategoriesTab: Creating category with data:", formData);
    
    // Use the parent's category create handler
    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color
      // Removed order field since it doesn't exist in database
    };
    
    onCategoryCreate(categoryData);
    
    // Reset form and close dialog
    setFormData({ name: "", description: "", color: colors[0] });
    setIsCreateOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (editingCategory) {
      onCategoryUpdate(editingCategory.id, formData);
      setIsEditOpen(false);
      setEditingCategory(null);
    }
  };

  const getCategoryItemCount = (categoryId: string) => {
    return stockItems.filter((item) => item.category_id === categoryId).length;
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-3">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600 text-sm">
            Organize your vegetables & legumes
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl text-base font-medium shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg">Create New Category</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new category to organize your stock items.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Category Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Fruits, Vegetables"
                  className="h-12 text-base rounded-xl mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category"
                  className="text-base rounded-xl mt-1 min-h-[80px]"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Category Color</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-full border-2 ${
                        formData.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300"
                      } transition-all duration-200`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col space-y-2">
              <Button
                onClick={handleCreate}
                disabled={!formData.name}
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                Create Category
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="w-full h-12 rounded-xl"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile-Optimized Categories Grid */}
      <div className="grid grid-cols-1 gap-3">
        {categories.length > 0 ? (
          categories.map((category) => {
            const itemCount = getCategoryItemCount(category.id);

            return (
              <Card
                key={category.id}
                className="rounded-xl border-0 shadow-lg bg-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold truncate">
                          {category.name}
                        </CardTitle>
                        {category.description && (
                          <CardDescription className="text-sm text-gray-600 line-clamp-2">
                            {category.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>

                    {/* Mobile-friendly action buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-10 w-10 p-0 rounded-full bg-blue-50 hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCategoryDelete(category.id)}
                        className="h-10 w-10 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 text-xs"
                    >
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Create your first category to organize your vegetables and legumes
            </p>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Category</DialogTitle>
            <DialogDescription className="text-sm">
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Category Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-12 text-base rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="text-base rounded-xl mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Category Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 ${
                      formData.color === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300"
                    } transition-all duration-200`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col space-y-2">
            <Button
              onClick={handleUpdate}
              className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl"
            >
              Update Category
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="w-full h-12 rounded-xl"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
