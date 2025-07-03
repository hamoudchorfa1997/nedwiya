"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Package, DollarSign, AlertTriangle } from "lucide-react";
import { DashboardStats, StockItem, Category } from "@/types";
import { calculateRemainingQuantity, isLowStock } from "@/lib/calculations";

interface DashboardOverviewProps {
  stats: DashboardStats;
  stockItems: StockItem[];
  categories: Category[];
}

export function DashboardOverview({
  stats,
  stockItems,
  categories,
}: DashboardOverviewProps) {
  const lowStockItems = stockItems.filter((item) => isLowStock(item));
  const recentItems = stockItems.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* App Logo and Definition - Mobile Optimized */}
      <div className="flex flex-col items-center justify-center py-4 px-4">
        <img
          src="/icon.jpg"
          alt="App Logo"
          className="w-16 h-16 rounded-xl shadow-lg mb-3 object-cover"
        />
        <h2 className="text-xl font-bold text-gray-900 mb-2">5drtSwyze</h2>
        <p className="text-gray-600 text-sm text-center leading-relaxed">
          Welcome to{" "}
          <span className="font-semibold text-green-700">5drt-swyz</span> — 3dl
          9dak w 3chak taf taf zyn wlla maho zyn maho mohim.
        </p>
      </div>

      {/* Stats Cards - Mobile Grid Layout */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-green-800">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-700">
              {stats.totalRevenue.toFixed(2)} MRU
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-blue-800">
              Total Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-700">
              {stats.profit.toFixed(2)} MRU
            </div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-purple-800">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-700">
              {stats.totalItems}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {stats.totalCategories} categories
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-red-800">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-700">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-red-600 mt-1">Need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Optimized Content Sections */}
      <div className="space-y-4">
        {/* Recent Stock Items - Mobile Layout */}
        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Recent Stock Items
            </CardTitle>
            <CardDescription className="text-sm">
              Your latest stock additions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentItems.length > 0 ? (
              recentItems.map((item) => {
                const category = categories.find(
                  (c) => c.id === item.category_id
                );
                const remaining = calculateRemainingQuantity(item);
                const isLow = isLowStock(item);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category?.color || "#gray" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-sm">{remaining} left</p>
                      {isLow && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No stock items yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Categories Overview - Mobile Layout */}
        <Card className="rounded-xl border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Categories Overview
            </CardTitle>
            <CardDescription className="text-sm">
              Stock distribution by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.length > 0 ? (
              categories.map((category) => {
                const categoryItems = stockItems.filter(
                  (item) => item.category_id === category.id
                );
                const totalItems = categoryItems.length;
                const lowStock = categoryItems.filter((item) =>
                  isLowStock(item)
                ).length;
                const percentage =
                  totalItems > 0
                    ? (categoryItems.reduce(
                        (sum, item) => sum + calculateRemainingQuantity(item),
                        0
                      ) /
                        categoryItems.reduce(
                          (sum, item) => sum + item.quantity_brought,
                          0
                        )) *
                      100
                    : 0;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm truncate">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {totalItems} items
                        </span>
                        {lowStock > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs text-red-600"
                          >
                            {lowStock} low
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No categories yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
