import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });
  const [selectedCategory, setSelectedCategory] = useState("");

  const expenses = useQuery(api.expenses.getUserExpenses, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    categoryId: selectedCategory ? (selectedCategory as any) : undefined,
  });
  const categories = useQuery(api.categories.getUserCategories);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const generateReport = () => {
    if (!expenses) return null;

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = new Map();
    const paymentMethodTotals = new Map();
    const dailyTotals = new Map();

    expenses.forEach(expense => {
      // Por categoria
      const categoryName = expense.category?.name || 'Sem categoria';
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + expense.amount);

      // Por método de pagamento
      paymentMethodTotals.set(
        expense.paymentMethod, 
        (paymentMethodTotals.get(expense.paymentMethod) || 0) + expense.amount
      );

      // Por dia
      dailyTotals.set(expense.date, (dailyTotals.get(expense.date) || 0) + expense.amount);
    });

    return {
      total,
      count: expenses.length,
      average: total / expenses.length || 0,
      categoryBreakdown: Array.from(categoryTotals.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount),
      paymentMethodBreakdown: Array.from(paymentMethodTotals.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount),
      dailyBreakdown: Array.from(dailyTotals.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  };

  const exportToCsv = () => {
    if (!expenses) return;

    const csvContent = [
      ['Data', 'Nome', 'Categoria', 'Valor', 'Método de Pagamento', 'Descrição'].join(','),
      ...expenses.map(expense => [
        expense.date,
        `"${expense.name}"`,
        `"${expense.category?.name || 'Sem categoria'}"`,
        expense.amount.toString().replace('.', ','),
        `"${expense.paymentMethod}"`,
        `"${expense.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-despesas-${dateRange.startDate}-${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const report = generateReport();

  if (!expenses || !categories) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6 text-center">
          📈 Relatórios e Análises
        </h2>

        {/* Filtros */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria (Opcional)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCsv}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-6"
        >
          📊 Exportar CSV
        </button>
      </div>

      {/* Summary */}
      {report && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(report.total)}
              </div>
              <div className="text-sm text-gray-500">Total Gasto</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-600">
                {report.count}
              </div>
              <div className="text-sm text-gray-500">Despesas</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(report.average)}
              </div>
              <div className="text-sm text-gray-500">Média</div>
            </div>
          </div>

          {/* Category Breakdown */}
          {report.categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-4">Por Categoria</h3>
              <div className="space-y-3">
                {report.categoryBreakdown.map((item, index) => {
                  const percentage = (item.amount / report.total) * 100;
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(1)}% do total
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Method Breakdown */}
          {report.paymentMethodBreakdown.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-4">Por Método de Pagamento</h3>
              <div className="space-y-2">
                {report.paymentMethodBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Expenses List */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-4">Despesas do Período</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.map((expense) => (
                <div key={expense._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{expense.name}</div>
                    <div className="text-xs text-gray-500">
                      {expense.category?.icon} {expense.category?.name} • {' '}
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {expense.paymentMethod}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {report && report.count === 0 && (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-semibold mb-2">Nenhuma despesa encontrada</h3>
          <p className="text-gray-500 text-sm">
            Ajuste os filtros ou adicione despesas para ver os relatórios.
          </p>
        </div>
      )}
    </div>
  );
}
