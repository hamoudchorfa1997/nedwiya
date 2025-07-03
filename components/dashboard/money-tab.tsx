"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { MoneyEntry } from "@/types";
import { calculateMoneyStats } from "@/lib/calculations";

interface MoneyTabProps {
  moneyEntries: MoneyEntry[];
  onMoneyEntryCreate: (
    entry: Omit<MoneyEntry, "id" | "created_at" | "updated_at">
  ) => void;
}

export function MoneyTab({ moneyEntries, onMoneyEntryCreate }: Readonly<MoneyTabProps>) {
  const [isDailyCreateOpen, setIsDailyCreateOpen] = useState(false);
  const [isMonthlyCreateOpen, setIsMonthlyCreateOpen] = useState(false);
  const [dailyFormData, setDailyFormData] = useState({
    amount: 0,
    type: "income" as "income" | "expense",
    description: "",
    category: "",
  });
  const [monthlyFormData, setMonthlyFormData] = useState({
    amount: 0,
    type: "income" as "income" | "expense",
    description: "",
    category: "",
  });

  const stats = calculateMoneyStats(moneyEntries);

  const handleDailyCreate = () => {
    onMoneyEntryCreate({
      ...dailyFormData,
      category: dailyFormData.category || undefined,
    });
    setDailyFormData({
      amount: 0,
      type: "income",
      description: "",
      category: "",
    });
    setIsDailyCreateOpen(false);
  };

  const handleMonthlyCreate = () => {
    onMoneyEntryCreate({
      ...monthlyFormData,
      category: monthlyFormData.category || undefined,
    });
    setMonthlyFormData({
      amount: 0,
      type: "income",
      description: "",
      category: "",
    });
    setIsMonthlyCreateOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "expense":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "income":
        return <Badge className="bg-green-100 text-green-800">Income</Badge>;
      case "expense":
        return <Badge className="bg-red-100 text-red-800">Expense</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-3">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Money Management</h2>
          <p className="text-gray-600 text-sm">
            Track your financial transactions
          </p>
        </div>

        {/* Daily Stats */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Today&apos;s Summary</h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-green-800">
                  Daily Income
                </div>
                <div className="text-lg font-bold text-green-700">
                  {stats.dailyIncome.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-red-800">
                  Daily Expenses
                </div>
                <div className="text-lg font-bold text-red-700">
                  {stats.dailyExpenses.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-800">
                  Daily Profit
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {stats.dailyProfit.toFixed(2)} MRU
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">
            This Month&apos;s Summary
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-green-800">
                  Monthly Income
                </div>
                <div className="text-lg font-bold text-green-700">
                  {stats.monthlyIncome.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-red-800">
                  Monthly Expenses
                </div>
                <div className="text-lg font-bold text-red-700">
                  {stats.monthlyExpenses.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-800">
                  Monthly Profit
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {stats.monthlyProfit.toFixed(2)} MRU
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Total Stats */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">Total Summary</h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-green-800">
                  Total Income
                </div>
                <div className="text-lg font-bold text-green-700">
                  {stats.totalIncome.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-red-800">
                  Total Expenses
                </div>
                <div className="text-lg font-bold text-red-700">
                  {stats.totalExpenses.toFixed(2)} MRU
                </div>
              </div>
            </Card>

            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
              <div className="text-center">
                <div className="text-xs font-medium text-blue-800">
                  Net Profit
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {stats.netProfit.toFixed(2)} MRU
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isDailyCreateOpen} onOpenChange={setIsDailyCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 bg-green-600 hover:bg-green-700 rounded-xl text-base font-medium shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Daily Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-sm rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg">Add Daily Entry</DialogTitle>
                <DialogDescription className="text-sm">
                  Record today&apos;s income or expense.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="daily-type" className="text-sm font-medium">
                    Entry Type
                  </Label>
                  <Select
                    value={dailyFormData.type}
                    onValueChange={(value: any) =>
                      setDailyFormData({ ...dailyFormData, type: value })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">
                        💰 Income
                      </SelectItem>
                      <SelectItem value="expense">
                        💸 Expense
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="daily-amount" className="text-sm font-medium">
                    Amount (MRU)
                  </Label>
                  <Input
                    id="daily-amount"
                    type="number"
                    step="0.01"
                    value={dailyFormData.amount}
                    onChange={(e) =>
                      setDailyFormData({ ...dailyFormData, amount: Number(e.target.value) })
                    }
                    placeholder="0.00"
                    className="h-12 text-base rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="daily-description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="daily-description"
                    value={dailyFormData.description}
                    onChange={(e) =>
                      setDailyFormData({ ...dailyFormData, description: e.target.value })
                    }
                    placeholder="Describe this entry..."
                    className="text-base rounded-xl mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="daily-category" className="text-sm font-medium">
                    Category (Optional)
                  </Label>
                  <Input
                    id="daily-category"
                    value={dailyFormData.category}
                    onChange={(e) =>
                      setDailyFormData({ ...dailyFormData, category: e.target.value })
                    }
                    placeholder="e.g., Business, Personal, Food..."
                    className="h-12 text-base rounded-xl mt-1"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col space-y-2">
                <Button
                  onClick={handleDailyCreate}
                  disabled={dailyFormData.amount <= 0 || !dailyFormData.description}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl"
                >
                  Add Daily Entry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDailyCreateOpen(false)}
                  className="w-full h-12 rounded-xl"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isMonthlyCreateOpen} onOpenChange={setIsMonthlyCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-medium shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Monthly Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-sm rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg">Add Monthly Entry</DialogTitle>
                <DialogDescription className="text-sm">
                  Record monthly income or expense.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthly-type" className="text-sm font-medium">
                    Entry Type
                  </Label>
                  <Select
                    value={monthlyFormData.type}
                    onValueChange={(value: any) =>
                      setMonthlyFormData({ ...monthlyFormData, type: value })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">
                        💰 Income
                      </SelectItem>
                      <SelectItem value="expense">
                        💸 Expense
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthly-amount" className="text-sm font-medium">
                    Amount (MRU)
                  </Label>
                  <Input
                    id="monthly-amount"
                    type="number"
                    step="0.01"
                    value={monthlyFormData.amount}
                    onChange={(e) =>
                      setMonthlyFormData({ ...monthlyFormData, amount: Number(e.target.value) })
                    }
                    placeholder="0.00"
                    className="h-12 text-base rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly-description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="monthly-description"
                    value={monthlyFormData.description}
                    onChange={(e) =>
                      setMonthlyFormData({ ...monthlyFormData, description: e.target.value })
                    }
                    placeholder="Describe this entry..."
                    className="text-base rounded-xl mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly-category" className="text-sm font-medium">
                    Category (Optional)
                  </Label>
                  <Input
                    id="monthly-category"
                    value={monthlyFormData.category}
                    onChange={(e) =>
                      setMonthlyFormData({ ...monthlyFormData, category: e.target.value })
                    }
                    placeholder="e.g., Business, Personal, Food..."
                    className="h-12 text-base rounded-xl mt-1"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col space-y-2">
                <Button
                  onClick={handleMonthlyCreate}
                  disabled={monthlyFormData.amount <= 0 || !monthlyFormData.description}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Add Monthly Entry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsMonthlyCreateOpen(false)}
                  className="w-full h-12 rounded-xl"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mobile-Optimized Transaction History */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          Transaction History
        </h3>

        {moneyEntries.length > 0 ? (
          moneyEntries.map((entry) => (
            <Card
              key={entry.id}
              className="rounded-xl border-0 shadow-lg bg-white"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(entry.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {entry.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        entry.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {entry.type === "expense" ? "-" : "+"}{Math.abs(entry.amount).toFixed(2)} MRU
                    </div>
                    {getTypeBadge(entry.type)}
                  </div>
                </div>

                {entry.category && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Category:</span>{" "}
                      {entry.category}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Start tracking your money by adding your first transaction
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
