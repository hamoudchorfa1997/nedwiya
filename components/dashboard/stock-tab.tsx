"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, AlertTriangle, Package } from "lucide-react";
import { StockItem, Category } from "@/types";
import {
  calculateRemainingQuantity,
  calculateTradeValue,
  calculateProfit,
  isLowStock,
} from "@/lib/calculations";

interface StockTabProps {
  stockItems: StockItem[];
  categories: Category[];
  onItemCreate: (
    item: Omit<StockItem, "id" | "created_at" | "updated_at">
  ) => void;
  onItemUpdate: (id: string, item: Partial<StockItem>) => void;
  onItemDelete: (id: string) => void;
  onRefreshCategories?: () => Promise<void>;
}

export function StockTab({
  stockItems,
  categories,
  onItemCreate,
  onItemUpdate,
  onItemDelete,
  onRefreshCategories,
}: Readonly<StockTabProps>) {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    quantity_brought: "",
    quantity_sold: "",
    price_per_unit: "",
    entry_cost: "",
  });

  // Reset form when categories change (in case selected category was deleted)
  useEffect(() => {
    if (formData.category_id && !categories.find(cat => cat.id === formData.category_id)) {
      console.log("🔄 Selected category no longer exists, clearing form...");
      setFormData(prev => ({
        ...prev,
        category_id: "",
      }));
    }
  }, [categories, formData.category_id]);

  const handleCreate = async () => {
    console.log("🎯 StockTab handleCreate called with formData:", formData);
    console.log("📋 Available categories:", categories.map(c => ({ id: c.id, name: c.name, idType: typeof c.id })));
    console.log("🔍 Selected category_id:", formData.category_id, "Type:", typeof formData.category_id);
    
    // Let's also log what's in the database by calling the refresh function
    if (onRefreshCategories) {
      console.log("🔄 Refreshing categories to see database state...");
      await onRefreshCategories();
    }
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }
    if (!formData.category_id) {
      toast({
        title: "Validation Error", 
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }
    
    // Check if selected category still exists
    const selectedCategory = categories.find(cat => cat.id === formData.category_id);
    console.log("🔍 Looking for category with ID:", formData.category_id);
    console.log("🔍 Category comparison results:");
    categories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.id} (${typeof cat.id}) === ${formData.category_id} (${typeof formData.category_id}) = ${cat.id === formData.category_id}`);
    });
    
    if (!selectedCategory) {
      toast({
        title: "Category Not Found",
        description: `Selected category no longer exists. Please select a different category.`,
        variant: "destructive",
      });
      console.error("❌ Selected category not found:", formData.category_id, "Available:", categories.map(c => ({ id: c.id, type: typeof c.id })));
      setFormData(prev => ({ ...prev, category_id: "" }));
      return;
    }
    
    console.log("✅ Selected category is valid:", selectedCategory);
    
    if (!formData.quantity_brought || Number(formData.quantity_brought) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity brought (must be greater than 0)",
        variant: "destructive",
      });
      return;
    }
    if (!formData.price_per_unit || Number(formData.price_per_unit) <= 0) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid price per unit (must be greater than 0)",
        variant: "destructive",
      });
      return;
    }
    if (!formData.entry_cost || Number(formData.entry_cost) < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid entry cost (cannot be negative)", 
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("🚀 StockTab: Submitting validated form data:", formData);
    console.log("🚀 Final category_id being sent:", formData.category_id, "Type:", typeof formData.category_id);
    
    try {
      // Call the parent's item-create handler with the form data.
      // Convert string values back to numbers for the API
      const itemData = {
        name: formData.name,
        category_id: formData.category_id,
        quantity_brought: Number(formData.quantity_brought),
        quantity_sold: Number(formData.quantity_sold) || 0,
        price_per_unit: Number(formData.price_per_unit),
        entry_cost: Number(formData.entry_cost),
      };
      await onItemCreate(itemData);
      
      // Reset form and close dialog.
      setFormData({
        name: "",
        category_id: "",
        quantity_brought: "",
        quantity_sold: "",
        price_per_unit: "",
        entry_cost: "",
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error in handleCreate:", error);
      toast({
        title: "Error Creating Item",
        description: "Failed to create stock item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      quantity_brought: String(item.quantity_brought),
      quantity_sold: String(item.quantity_sold),
      price_per_unit: String(item.price_per_unit),
      entry_cost: String(item.entry_cost),
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (editingItem) {
      // Convert string values back to numbers for the API
      const updateData = {
        name: formData.name,
        category_id: formData.category_id,
        quantity_brought: Number(formData.quantity_brought),
        quantity_sold: Number(formData.quantity_sold) || 0,
        price_per_unit: Number(formData.price_per_unit),
        entry_cost: Number(formData.entry_cost),
      };
      onItemUpdate(editingItem.id, updateData);
      
      toast({
        title: "Item Updated! ✅",
        description: `${formData.name} has been updated successfully`,
        variant: "default",
      });
      
      setIsEditOpen(false);
      setEditingItem(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name ?? "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color ?? "#ccc";
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-3">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Stock Items</h2>
          <p className="text-gray-600 text-sm">
            Manage your inventory and track stock
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl text-base font-medium shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Stock Item
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Add New Stock Item</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new item to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Item Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Red Apples, Tomatoes"
                  className="h-12 text-base rounded-xl mt-1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category
                  </Label>
                  {onRefreshCategories && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onRefreshCategories}
                      className="h-6 px-2 text-xs"
                    >
                      🔄 Refresh
                    </Button>
                  )}
                </div>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="" disabled>
                        No categories available - create one first
                      </SelectItem>
                    ) : (
                      categories.map((category) => {
                        console.log("🎯 Rendering category option:", category.id, category.name);
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.name}</span>
                              <span className="text-xs text-gray-500">({category.id})</span>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label
                    htmlFor="quantity_brought"
                    className="text-sm font-medium"
                  >
                    Quantity Brought
                  </Label>
                  <Input
                    id="quantity_brought"
                    type="number"
                    min="1"
                    value={formData.quantity_brought}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive numbers
                      if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                        setFormData({
                          ...formData,
                          quantity_brought: value,
                        });
                      }
                    }}
                    className="h-12 text-base rounded-xl mt-1"
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="quantity_sold"
                    className="text-sm font-medium"
                  >
                    Quantity Sold
                  </Label>
                  <Input
                    id="quantity_sold"
                    type="number"
                    min="0"
                    value={formData.quantity_sold}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow non-negative numbers
                      if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                        setFormData({
                          ...formData,
                          quantity_sold: value,
                        });
                      }
                    }}
                    className="h-12 text-base rounded-xl mt-1"
                    placeholder="Enter quantity sold"
                  />
                </div>
                <div>                <Label htmlFor="entry_cost" className="text-sm font-medium">
                  Entry Cost per Unit (MRU)
                  </Label>
                  <Input
                    id="entry_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.entry_cost}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow non-negative numbers
                      if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                        setFormData({
                          ...formData,
                          entry_cost: value,
                        });
                      }
                    }}
                    className="h-12 text-base rounded-xl mt-1"
                    placeholder="Enter cost per unit"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="price_per_unit"
                    className="text-sm font-medium"
                  >
                    Selling Price per Unit (MRU)
                  </Label>
                  <Input
                    id="price_per_unit"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive numbers
                      if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                        setFormData({
                          ...formData,
                          price_per_unit: value,
                        });
                      }
                    }}
                    className="h-12 text-base rounded-xl mt-1"
                    placeholder="Enter selling price"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col space-y-2">
              <Button
                onClick={handleCreate}
                disabled={!formData.name || !formData.category_id || !formData.quantity_brought || !formData.price_per_unit || !formData.entry_cost || isLoading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                {isLoading ? "Adding..." : "Add Item"}
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

      {/* Mobile-Optimized Stock Items List */}
      <div className="space-y-3">
        {stockItems.length > 0 ? (
          stockItems.map((item) => {
            const remaining = calculateRemainingQuantity(item);
            const tradeValue = calculateTradeValue(item);
            const profit = calculateProfit(item);
            const lowStock = isLowStock(item);
            const categoryColor = getCategoryColor(item.category_id);

            return (
              <Card
                key={item.id}
                className="rounded-xl border-0 shadow-lg bg-white"
              >
                <CardContent className="p-4">
                  {/* Header with name and actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="text-sm text-gray-600">
                          {getCategoryName(item.category_id)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-10 w-10 p-0 rounded-full bg-blue-50 hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onItemDelete(item.id)}
                        className="h-10 w-10 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="mb-3">
                    {lowStock ? (
                      <Badge
                        variant="destructive"
                        className="flex items-center space-x-1 w-fit"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        In Stock
                      </Badge>
                    )}
                  </div>

                  {/* Stock Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brought:</span>
                        <span className="font-medium">
                          {item.quantity_brought}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sold:</span>
                        <span className="font-medium">
                          {item.quantity_sold}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span
                          className={`font-medium ${
                            lowStock ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {remaining}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trade Value:</span>
                        <span className="font-medium text-green-600">
                          {tradeValue.toFixed(2)} MRU
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit:</span>
                        <span
                          className={`font-medium ${
                            profit >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {profit.toFixed(2)} MRU
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price/Unit:</span>
                        <span className="font-medium">
                          {item.price_per_unit.toFixed(2)} MRU
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No stock items yet
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Add your first stock item to start tracking inventory
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Stock Item</DialogTitle>
            <DialogDescription className="text-sm">
              Update the stock item information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Item Name
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
              <Label htmlFor="edit-category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger className="h-12 rounded-xl mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label
                  htmlFor="edit-quantity_brought"
                  className="text-sm font-medium"
                >
                  Quantity Brought
                </Label>
                <Input
                  id="edit-quantity_brought"
                  type="number"
                  min="1"
                  value={formData.quantity_brought}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                      setFormData({
                        ...formData,
                        quantity_brought: value,
                      });
                    }
                  }}
                  className="h-12 text-base rounded-xl mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-quantity_sold"
                  className="text-sm font-medium"
                >
                  Quantity Sold
                </Label>
                <Input
                  id="edit-quantity_sold"
                  type="number"
                  min="0"
                  value={formData.quantity_sold}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                      setFormData({
                        ...formData,
                        quantity_sold: value,
                      });
                    }
                  }}
                  className="h-12 text-base rounded-xl mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-entry_cost"
                  className="text-sm font-medium"
                >
                  Entry Cost per Unit (MRU)
                </Label>
                <Input
                  id="edit-entry_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entry_cost}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                      setFormData({
                        ...formData,
                        entry_cost: value,
                      });
                    }
                  }}
                  className="h-12 text-base rounded-xl mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-price_per_unit"
                  className="text-sm font-medium"
                >
                  Selling Price per Unit (MRU)
                </Label>
                <Input
                  id="edit-price_per_unit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.price_per_unit}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                      setFormData({
                        ...formData,
                        price_per_unit: value,
                      });
                    }
                  }}
                  className="h-12 text-base rounded-xl mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col space-y-2">
            <Button
              onClick={handleUpdate}
              className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl"
            >
              Update Item
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
