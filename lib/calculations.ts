import { StockItem, MoneyEntry } from '@/types';

export const calculateRemainingQuantity = (item: StockItem): number => {
  return Math.max(0, item.quantity_brought - item.quantity_sold);
};

export const calculateTradeValue = (item: StockItem): number => {
  return item.quantity_sold * item.price_per_unit;
};

export const calculateTotalCost = (item: StockItem): number => {
  return item.quantity_brought * item.entry_cost;
};

export const calculateProfit = (item: StockItem): number => {
  const revenue = calculateTradeValue(item);
  const cost = calculateTotalCost(item);
  return revenue - cost;
};

// New function to calculate business stats from stock items
export const calculateBusinessStats = (stockItems: StockItem[]) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayStr = today.toISOString().split('T')[0];

  // For now, since we don't track individual sales by date, 
  // we'll show daily stats only if items were updated today
  // This is a simplified approach - proper sales tracking would need transaction records
  
  // Filter items that were updated today (new sales or updates)
  const todayItems = stockItems.filter(item => 
    item.updated_at?.startsWith(todayStr)
  );
  
  // Filter items that were updated this month
  const monthlyItems = stockItems.filter(item => {
    if (!item.updated_at) return false;
    const itemDate = new Date(item.updated_at);
    return itemDate.getMonth() === currentMonth && 
           itemDate.getFullYear() === currentYear;
  });

  // Daily calculations - show proportional values based on today's activity
  // This is a simplified calculation - in a real system you'd track individual sales
  const dailyRevenue = todayItems.reduce((sum, item) => {
    // Show full revenue for items updated today as a proxy for daily sales
    return sum + calculateTradeValue(item);
  }, 0);
  
  const dailyCosts = todayItems.reduce((sum, item) => {
    return sum + (item.quantity_sold * item.entry_cost);
  }, 0);
  
  const dailyProfit = dailyRevenue - dailyCosts;

  // Monthly calculations - same approach for items updated this month
  const monthlyRevenue = monthlyItems.reduce((sum, item) => {
    return sum + calculateTradeValue(item);
  }, 0);
  
  const monthlyCosts = monthlyItems.reduce((sum, item) => {
    return sum + (item.quantity_sold * item.entry_cost);
  }, 0);
  
  const monthlyProfit = monthlyRevenue - monthlyCosts;

  // Total calculations (all time)
  const totalRevenue = stockItems.reduce((sum, item) => sum + calculateTradeValue(item), 0);
  const totalCosts = stockItems.reduce((sum, item) => sum + (item.quantity_sold * item.entry_cost), 0);
  const totalInvestment = stockItems.reduce((sum, item) => sum + calculateTotalCost(item), 0);
  const totalProfit = totalRevenue - totalCosts;
  const netProfit = totalRevenue - totalInvestment; // Profit considering all bought items

  return {
    // Daily stats
    dailyRevenue,
    dailyCosts,
    dailyProfit,
    
    // Monthly stats
    monthlyRevenue,
    monthlyCosts,
    monthlyProfit,
    
    // Total business stats
    totalRevenue,
    totalCosts,
    totalInvestment,
    totalProfit,
    netProfit,
    
    // Additional useful metrics
    totalItemsSold: stockItems.reduce((sum, item) => sum + item.quantity_sold, 0),
    totalItemsBought: stockItems.reduce((sum, item) => sum + item.quantity_brought, 0),
    inventoryValue: stockItems.reduce((sum, item) => 
      sum + (calculateRemainingQuantity(item) * item.entry_cost), 0
    ),
  };
};

// Legacy function for backward compatibility (deprecated)
export const calculateMoneyStats = (entries: MoneyEntry[]) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayStr = today.toISOString().split('T')[0];

  // Daily calculations
  const dailyEntries = entries.filter(e => 
    e.created_at.startsWith(todayStr)
  );
  
  const dailyIncome = dailyEntries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const dailyExpenses = dailyEntries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const dailyProfit = dailyIncome - dailyExpenses;

  // Monthly calculations
  const monthlyEntries = entries.filter(e => {
    const entryDate = new Date(e.created_at);
    return entryDate.getMonth() === currentMonth && 
           entryDate.getFullYear() === currentYear;
  });
  
  const monthlyIncome = monthlyEntries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const monthlyExpenses = monthlyEntries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const monthlyProfit = monthlyIncome - monthlyExpenses;

  // Total calculations (all time)
  const totalIncome = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpenses = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  
  return {
    // Daily stats
    dailyIncome,
    dailyExpenses,
    dailyProfit,
    
    // Monthly stats
    monthlyIncome,
    monthlyExpenses,
    monthlyProfit,
    
    // Total stats
    totalIncome,
    totalExpenses,
    netProfit,
    
    // Legacy properties for backward compatibility
    entryMoney: totalIncome,
    usedMoney: totalExpenses,
    salesMoney: 0, // No longer relevant
    totalMoney: netProfit,
    profit: netProfit,
  };
};

export const isLowStock = (item: StockItem, threshold: number = 10): boolean => {
  return calculateRemainingQuantity(item) <= threshold;
};