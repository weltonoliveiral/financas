import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  
  const stats = useQuery(api.expenses.getDashboardStats, { 
    month: selectedMonth 
  });
  const budgetAlerts = useQuery(api.budgets.getBudgetAlerts);

  if (!stats) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getMonthName = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const changeMonth = (direction: number) => {
    const currentDate = new Date(selectedMonth + '-01');
    currentDate.setMonth(currentDate.getMonth() + direction);
    setSelectedMonth(currentDate.toISOString().slice(0, 7));
  };

  const monthComparison = stats.totalPrevMonth > 0 
    ? ((stats.totalMonth - stats.totalPrevMonth) / stats.totalPrevMonth) * 100
    : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {getMonthName(selectedMonth)}
        </h2>
        <button 
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          →
        </button>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts && budgetAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Alertas de Orçamento</h3>
          {budgetAlerts.map((alert, index) => (
            <div key={index} className="text-sm text-red-700 mb-1">
              {alert.categoryIcon} {alert.categoryName}: {alert.percentage.toFixed(0)}% usado
              {alert.type === 'exceeded' && ' (Limite ultrapassado!)'}
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total do Mês</div>
          <div className="text-xl font-bold text-red-600">
            {formatCurrency(stats.totalMonth)}
          </div>
          {monthComparison !== 0 && (
            <div className={`text-xs ${monthComparison > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {monthComparison > 0 ? '↑' : '↓'} {Math.abs(monthComparison).toFixed(1)}% vs mês anterior
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Média Diária</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(stats.dailyAverage)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.expenseCount} despesas
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Gastos por Categoria</h3>
          <div className="space-y-3">
            {stats.categoryBreakdown
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map((category, index) => {
                const percentage = (category.total / stats.totalMonth) * 100;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatCurrency(category.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      {stats.recentExpenses.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Despesas Recentes</h3>
          <div className="space-y-3">
            {stats.recentExpenses.map((expense, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{expense.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-sm font-semibold text-red-600">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalMonth === 0 && (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-semibold mb-2">Nenhuma despesa registrada</h3>
          <p className="text-gray-500 text-sm mb-4">
            Comece adicionando suas primeiras despesas para ver o resumo aqui.
          </p>
        </div>
      )}
    </div>
  );
}
