export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface StockItem {
  id: string;
  name: string;
  category_id: string;
  quantity_brought: number;
  quantity_sold: number;
  price_per_unit: number;
  entry_cost: number;
  created_at: string;
  updated_at: string;
}

export interface MoneyEntry {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  category?: string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalCategories: number;
  totalItems: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  lowStockItems: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}
