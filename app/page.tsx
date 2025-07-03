"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { CategoriesTab } from "@/components/dashboard/categories-tab";
import { StockTab } from "@/components/dashboard/stock-tab";
import { BusinessAnalytics } from "@/components/dashboard/business-analytics";
import {
  calculateTradeValue,
  calculateProfit,
  isLowStock,
} from "@/lib/calculations";
import { Category, StockItem, DashboardStats } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  BarChart3,
  Info,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "stock", label: "Stock", icon: Package },
  { id: "money", label: "Analytics", icon: BarChart3 },
  { id: "about", label: "About", icon: Info },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCategories: 0,
    totalItems: 0,
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    lowStockItems: 0,
    totalIncome: 0, // Will be calculated in MoneyTab
    totalExpenses: 0, // Will be calculated in MoneyTab
    netProfit: 0, // Will be calculated in MoneyTab
  });

  useEffect(() => {
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        setIsAuthenticated(true);
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      console.log("🔄 Fetching data from Supabase...");
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*");
      console.log("📥 Categories fetch result:", { data: categoriesData, error: categoriesError });
      
      if (categoriesData) {
        console.log("📊 Categories data types and values:");
        categoriesData.forEach((cat: any, index: number) => {
          console.log(`  ${index + 1}. ${cat.name}: ID = ${cat.id} (${typeof cat.id})`);
        });
      }
      
      setCategories(categoriesData || []);

      const { data: stockItemsData, error: stockItemsError } = await supabase
        .from("stock_items")
        .select("*");
      console.log("📥 Stock items fetch result:", { data: stockItemsData, error: stockItemsError });
      setStockItems(stockItemsData || []);
    };
    
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const stats: DashboardStats = {
      totalCategories: categories.length,
      totalItems: stockItems.length,
      totalRevenue: stockItems.reduce(
        (sum, item) => sum + calculateTradeValue(item),
        0
      ),
      totalCost: stockItems.reduce(
        (sum, item) => sum + item.quantity_brought * item.entry_cost,
        0
      ),
      profit: stockItems.reduce((sum, item) => sum + calculateProfit(item), 0),
      lowStockItems: stockItems.filter((item) => isLowStock(item)).length,
      totalIncome: 0, // Will be calculated in MoneyTab
      totalExpenses: 0, // Will be calculated in MoneyTab
      netProfit: 0, // Will be calculated in MoneyTab
    };
    setDashboardStats(stats);
  }, [categories, stockItems]);

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.session) {
      setUser(data.session.user);
      setIsAuthenticated(true);
    } else {
      toast({
        title: "Login Failed",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab("dashboard");
  };

  const handleCategoryCreate = async (
    categoryData: Omit<Category, "id" | "created_at" | "updated_at">
  ) => {
    console.log("Creating category with data:", categoryData);
    
    // Don't add user_id since the column doesn't exist in the database
    const categoryToInsert = {
      ...categoryData
    };
    
    const { data, error } = await supabase
      .from("categories")
      .insert([categoryToInsert])
      .select();
    console.log("Category creation response:", { data, error });
    if (!error && data) {
      setCategories([...categories, ...data]);
      console.log("Category created successfully");
      toast({
        title: "Category Created",
        description: `Category "${categoryData.name}" has been created successfully.`,
        variant: "default",
      });
    } else {
      console.error("Error creating category:", error);
      if (error?.message?.includes('row-level security')) {
        toast({
          title: "Database Security Error",
          description: `Database security error: ${error.message}. Solutions: 1. Disable RLS on categories table 2. Create RLS policies for authenticated users 3. Use service role key for development`,
          variant: "destructive",
        });
      } else if (error?.message?.includes('user_id')) {
        toast({
          title: "Column Error",
          description: `Column error: ${error.message}. The database schema doesn't match the code. Check the database structure.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Create Category",
          description: error?.message || 'Unknown error occurred while creating the category.',
          variant: "destructive",
        });
      }
    }
  };

  const handleCategoryUpdate = async (
    id: string,
    updates: Partial<Category>
  ) => {
    const { data, error } = await supabase
      .from("categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (!error && data)
      setCategories(
        categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
      );
  };

  const handleCategoryDelete = async (id: string) => {
    const hasItems = stockItems.some((item) => item.category_id === id);
    if (hasItems) {
      toast({
        title: "Cannot Delete Category",
        description: "Cannot delete category with existing items. Please move or delete items first.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setCategories(categories.filter((cat) => cat.id !== id));
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
        variant: "default",
      });
    } else {
      toast({
        title: "Failed to Delete Category",
        description: error?.message || "An error occurred while deleting the category.",
        variant: "destructive",
      });
    }
  };

  const handleItemCreate = async (
    itemData: Omit<StockItem, "id" | "created_at" | "updated_at">
  ) => {
    console.log("=== STOCK ITEM CREATION DEBUG ===");
    console.log("Creating item with data:", itemData);
    
    // First, let's fetch ALL categories from the database to see what's actually there
    console.log("Fetching all categories from database for verification...");
    const { data: allCategoriesInDB, error: fetchError } = await supabase
      .from("categories")
      .select("*");
    
    console.log("All categories in database:", allCategoriesInDB);
    console.log("Categories in local state:", categories);
    console.log("Database fetch error:", fetchError);
    
    if (allCategoriesInDB) {
      console.log("Database category IDs:", allCategoriesInDB.map((c: any) => `${c.id} (${typeof c.id})`));
      console.log("Local state category IDs:", categories.map(c => `${c.id} (${typeof c.id})`));
    }
    
    // Validate that the category exists before inserting
    if (!itemData.category_id) {
      toast({
        title: "Category Required",
        description: "Please select a category before creating the item.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Selected category_id:", itemData.category_id, "Type:", typeof itemData.category_id);
    
    // Check in local state
    const categoryExists = categories.find(cat => cat.id === itemData.category_id);
    console.log("Category found in local state:", categoryExists);
    
    // Check in fresh database data
    const categoryInDB = allCategoriesInDB?.find((cat: any) => cat.id === itemData.category_id);
    console.log("Category found in database:", categoryInDB);
    
    if (!categoryExists) {
      toast({
        title: "Category Not Found",
        description: `Selected category (ID: ${itemData.category_id}) does not exist in local state. Available categories: ${categories.map(c => c.id).join(', ')}`,
        variant: "destructive",
      });
      console.error("Category not found in local state:", itemData.category_id, "Available categories:", categories);
      return;
    }
    
    if (!categoryInDB) {
      console.warn("🔄 Category not found in database, refreshing categories...");
      await refreshCategories();
      
      // Fetch fresh categories after refresh
      const { data: freshCategories } = await supabase
        .from("categories")
        .select("*");
      
      // Check again with fresh data
      const categoryAfterRefresh = freshCategories?.find((cat: any) => cat.id === itemData.category_id);
      
      if (!categoryAfterRefresh) {
        toast({
          title: "Category Not Found in Database",
          description: `Selected category (ID: ${itemData.category_id}) does not exist in database even after refresh. Available categories in DB: ${freshCategories?.map((c: any) => c.id).join(', ') || 'none'}. Please select a different category or create a new one.`,
          variant: "destructive",
        });
        console.error("Category not found in database even after refresh:", itemData.category_id, "Available categories in DB:", freshCategories);
        return;
      }
      
      console.log("✅ Category found after refresh:", categoryAfterRefresh);
    }
    
    console.log("Category validation passed for both local state and database");
    
    // Validate all required fields
    const requiredFields = ['name', 'category_id', 'quantity_brought', 'price_per_unit', 'entry_cost'] as const;
    for (const field of requiredFields) {
      if (itemData[field] === undefined || itemData[field] === null || itemData[field] === '') {
        toast({
          title: "Missing Required Field",
          description: `Please fill in the ${field.replace('_', ' ')} field.`,
          variant: "destructive",
        });
        console.error(`Missing field: ${field}`, itemData);
        return;
      }
    }
    
    // Clean and prepare data for insert
    const itemToInsert = {
      name: String(itemData.name).trim(),
      category_id: String(itemData.category_id), // Ensure it's a string
      quantity_brought: Number(itemData.quantity_brought),
      quantity_sold: Number(itemData.quantity_sold) || 0,
      price_per_unit: Number(itemData.price_per_unit),
      entry_cost: Number(itemData.entry_cost)
    };
    
    console.log("📤 Final data to insert:", itemToInsert);
    console.log("📤 Data types:", {
      name: typeof itemToInsert.name,
      category_id: typeof itemToInsert.category_id,
      quantity_brought: typeof itemToInsert.quantity_brought,
      quantity_sold: typeof itemToInsert.quantity_sold,
      price_per_unit: typeof itemToInsert.price_per_unit,
      entry_cost: typeof itemToInsert.entry_cost
    });
    
    // FINAL CHECK: Verify category exists in database right before insert
    console.log("🔍 FINAL DATABASE CHECK before insert...");
    const { data: finalCategoryCheck, error: finalCheckError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", itemToInsert.category_id);
    
    console.log("🔍 Final category check result:", { data: finalCategoryCheck, error: finalCheckError });
    console.log("🔍 Looking for category_id:", itemToInsert.category_id, "Type:", typeof itemToInsert.category_id);
    
    if (finalCheckError || !finalCategoryCheck || finalCategoryCheck.length === 0) {
      toast({
        title: "Final Category Check Failed",
        description: `Category "${itemToInsert.category_id}" does not exist in database. Please: 1. Refresh the page 2. Create the category first 3. Or select a different category`,
        variant: "destructive",
      });
      console.error("❌ Final category check failed:", finalCheckError, finalCategoryCheck);
      return;
    }
    
    console.log("✅ FINAL CHECK PASSED - Category exists:", finalCategoryCheck[0]);
    
    // Validate numeric values
    if (itemToInsert.quantity_brought <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity brought must be greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (itemToInsert.price_per_unit <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price per unit must be greater than 0.",
        variant: "destructive",
      });
      return;
    }
    if (itemToInsert.entry_cost < 0) {
      toast({
        title: "Invalid Cost",
        description: "Entry cost cannot be negative.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("🚀 Attempting database insert...");
    
    const { data, error } = await supabase
      .from("stock_items")
      .insert([itemToInsert])
      .select();
      
    console.log("📥 Supabase response:", { data, error });
    
    if (!error && data) {
      setStockItems([...stockItems, ...data]);
      console.log("✅ Item created successfully!");
      toast({
        title: "Stock Item Created",
        description: `"${itemToInsert.name}" has been added to your inventory successfully.`,
        variant: "default",
      });
    } else {
      console.error("❌ Error creating item:", error);
      
      if (error?.message?.includes('foreign key constraint')) {
        const constraintMatch = error.message.match(/constraint "([^"]+)"/);
        const constraintName = constraintMatch?.[1] || 'unknown';
        
        console.error("🔗 Foreign key constraint details:");
        console.error("- Constraint name:", constraintName);
        console.error("- Category ID attempted:", itemToInsert.category_id);
        console.error("- Local categories:", categories.map(c => c.id));
        console.error("- Database categories:", allCategoriesInDB?.map((c: any) => c.id));
        
        toast({
          title: "Foreign Key Constraint Violation",
          description: `Constraint: ${constraintName}. Category ID "${itemToInsert.category_id}" doesn't exist in the database. Solution: Refresh the page to reload categories from database.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Create Item",
          description: error?.message || 'Unknown error occurred. Check the browser console for detailed information.',
          variant: "destructive",
        });
      }
    }
  };

  const handleItemUpdate = async (id: string, updates: Partial<StockItem>) => {
    const { data, error } = await supabase
      .from("stock_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (!error && data)
      setStockItems(
        stockItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
  };

  const handleItemDelete = async (id: string) => {
    const { error } = await supabase.from("stock_items").delete().eq("id", id);
    if (!error) setStockItems(stockItems.filter((item) => item.id !== id));
  };

  // Function to refresh categories from database
  const refreshCategories = async (): Promise<void> => {
    console.log("🔄 Refreshing categories from database...");
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*");
    console.log("Categories refresh result:", { data: categoriesData, error: categoriesError });
    
    if (categoriesData) {
      setCategories(categoriesData);
      console.log("✅ Categories refreshed successfully:", categoriesData);
    } else {
      console.error("❌ Failed to refresh categories:", categoriesError);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} onToggleAuth={() => {}} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      {/* Top Navigation Bar - Mobile Optimized */}
      <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-3 py-3 bg-white border-b border-gray-200 shadow-sm">
        {/* Horizontal scrollable navigation */}
        <div className="flex-1 mr-3">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`
                    min-w-[70px] h-12 px-2 py-1 text-xs font-medium whitespace-nowrap rounded-lg flex flex-col items-center justify-center gap-1
                    ${
                      activeTab === item.id
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => setActiveTab(item.id)}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Logout button */}
        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 text-xs font-medium min-w-[60px] h-10 rounded-lg"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </nav>

      {/* Main Content with proper mobile spacing */}
      <div className="flex-1 overflow-auto">
        <div className="p-3 pb-20">
          {activeTab === "dashboard" && (
            <DashboardOverview
              stats={dashboardStats}
              stockItems={stockItems}
              categories={categories}
            />
          )}
          {activeTab === "categories" && (
            <CategoriesTab
              categories={categories}
              stockItems={stockItems}
              onCategoryCreate={handleCategoryCreate}
              onCategoryUpdate={handleCategoryUpdate}
              onCategoryDelete={handleCategoryDelete}
            />
          )}
          {activeTab === "stock" && (
            <StockTab
              stockItems={stockItems}
              categories={categories}
              onItemCreate={handleItemCreate}
              onItemUpdate={handleItemUpdate}
              onItemDelete={handleItemDelete}
              onRefreshCategories={refreshCategories}
            />
          )}
          {activeTab === "money" && (
            <BusinessAnalytics
              stockItems={stockItems}
            />
          )}
          {activeTab === "about" && (
            <div className="space-y-6">
              {/* App Logo and Title */}
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-8 rounded-3xl overflow-hidden shadow-xl">
                  <Image 
                    src="/icon.jpg" 
                    alt="Nedwiyt 16 Logo" 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Nedwiyt 16
                </h1>
                <p className="text-gray-600 text-xl mb-8">
                  Smart Inventory Management
                </p>
                <p className="text-gray-700 text-base max-w-md mx-auto leading-relaxed">
                  A modern inventory management system designed for small businesses 
                  dealing with vegetables, legumes, and fresh produce.
                </p>
              </div>

              {/* Simple Features */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4">
                    <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Inventory</h4>
                    <p className="text-sm text-gray-600">Track your stock</p>
                  </div>
                  <div className="p-4">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Analytics</h4>
                    <p className="text-sm text-gray-600">Monitor profits</p>
                  </div>
                  <div className="p-4">
                    <FolderOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Categories</h4>
                    <p className="text-sm text-gray-600">Organize items</p>
                  </div>
                  <div className="p-4">
                    <Info className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Simple</h4>
                    <p className="text-sm text-gray-600">Easy to use</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center py-6 text-gray-500 text-sm">
                <p>© 2025 Nedwiyt 16</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
