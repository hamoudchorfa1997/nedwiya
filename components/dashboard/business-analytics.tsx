"use client";

import {
  Card,
} from "@/components/ui/card";
import {
  TrendingDown,
  Wallet,
  ShoppingCart,
  Package,
  BarChart3,
} from "lucide-react";
import { StockItem } from "@/types";
import { calculateBusinessStats, calculateProfit } from "@/lib/calculations";

interface BusinessAnalyticsProps {
  stockItems: StockItem[];
}

export function BusinessAnalytics({ stockItems }: Readonly<BusinessAnalyticsProps>) {
  const stats = calculateBusinessStats(stockItems);

  // Get top performing items
  const topItems = stockItems
    .map(item => ({ ...item, profit: calculateProfit(item) }))
    .filter(item => item.profit > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Get worst performing items
  const lossItems = stockItems
    .map(item => ({ ...item, profit: calculateProfit(item) }))
    .filter(item => item.profit < 0)
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-3">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Business Analytics</h2>
          <p className="text-gray-600 text-sm">
            Automatic profit tracking from your sales
          </p>
        </div>

        {/* Analytics Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-blue-800">
            <strong>📊 How Analytics Work:</strong> Daily & monthly stats show items updated today/this month. 
            Total stats show all-time performance. For real-time sales tracking, consider adding a separate transactions system.
          </div>
        </div>

        {/* Daily Performance */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Today&apos;s Performance</h3>
          <div className="text-xs text-gray-600 mb-2 text-center">
            {stats.dailyRevenue > 0 ? "Items updated today" : "No items updated today"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-green-800">
                  Daily Revenue
                </div>
                <div className="text-lg font-bold text-green-700">
                  {stats.dailyRevenue.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-red-800">
                  Daily Costs
                </div>
                <div className="text-lg font-bold text-red-700">
                  {stats.dailyCosts.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-800">
                  Daily Profit
                </div>
                <div className={`text-lg font-bold ${stats.dailyProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {stats.dailyProfit >= 0 ? '+' : ''}{stats.dailyProfit.toFixed(2)} MRU
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">This Month&apos;s Performance</h3>
          <div className="text-xs text-gray-600 mb-2 text-center">
            {stats.monthlyRevenue > 0 ? "Items updated this month" : "No items updated this month"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-green-800">
                  Monthly Revenue
                </div>
                <div className="text-lg font-bold text-green-700">
                  {stats.monthlyRevenue.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-red-800">
                  Monthly Costs
                </div>
                <div className="text-lg font-bold text-red-700">
                  {stats.monthlyCosts.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-800">
                  Monthly Profit
                </div>
                <div className={`text-lg font-bold ${stats.monthlyProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {stats.monthlyProfit >= 0 ? '+' : ''}{stats.monthlyProfit.toFixed(2)} MRU
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Total Business Overview */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Total Business Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-green-800">
                  Total Revenue
                </div>
                <div className="text-lg font-bold text-green-700">
                  {stats.totalRevenue.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-purple-800">
                  Total Investment
                </div>
                <div className="text-lg font-bold text-purple-700">
                  {stats.totalInvestment.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-800">
                  Net Profit
                </div>
                <div className={`text-lg font-bold ${stats.netProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-yellow-800">
                  Inventory Value
                </div>
                <div className="text-lg font-bold text-yellow-700">
                  {stats.inventoryValue.toFixed(2)} MRU
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Business Metrics</h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 p-3">
              <div className="text-center">
                <ShoppingCart className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                <div className="text-xs font-medium text-indigo-800">
                  Items Sold
                </div>
                <div className="text-lg font-bold text-indigo-700">
                  {stats.totalItemsSold}
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 p-3">
              <div className="text-center">
                <Package className="h-6 w-6 text-teal-600 mx-auto mb-1" />
                <div className="text-xs font-medium text-teal-800">
                  Items Bought
                </div>
                <div className="text-lg font-bold text-teal-700">
                  {stats.totalItemsBought}
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 p-3">
              <div className="text-center">
                <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div className="text-xs font-medium text-orange-800">
                  Success Rate
                </div>
                <div className="text-lg font-bold text-orange-700">
                  {stats.totalItemsBought > 0 ? ((stats.totalItemsSold / stats.totalItemsBought) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="space-y-4">
        {/* Top Performing Items */}
        {topItems.length > 0 && (
          <Card className="rounded-xl border-0 shadow-lg">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-center text-green-700">
                🏆 Top Performing Items
              </h3>
              <div className="space-y-2">
                {topItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-green-900">{item.name}</p>
                        <p className="text-xs text-green-600">Sold: {item.quantity_sold} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-700">
                        +{item.profit.toFixed(2)} MRU
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Loss Making Items */}
        {lossItems.length > 0 && (
          <Card className="rounded-xl border-0 shadow-lg">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-center text-red-700">
                ⚠️ Items Needing Attention
              </h3>
              <div className="space-y-2">
                {lossItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-sm text-red-900">{item.name}</p>
                        <p className="text-xs text-red-600">Sold: {item.quantity_sold} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-700">
                        {item.profit.toFixed(2)} MRU
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* No data state */}
        {stockItems.length === 0 && (
          <Card className="rounded-xl border-0 shadow-lg">
            <div className="p-8 text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No business data yet
              </h3>
              <p className="text-gray-600 text-sm">
                Add some stock items and start selling to see your business analytics
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
