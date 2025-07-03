'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  Folder, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  Leaf
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'categories', label: 'Categories', icon: Folder },
  { id: 'stock', label: 'Stock Items', icon: Package },
  { id: 'money', label: 'Money Management', icon: DollarSign },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/icon.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">StockFresh</h1>
            <p className="text-xs text-gray-500">Stock Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start px-4 py-3 h-auto',
                activeTab === item.id 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}