import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function Budgets() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({
    categoryId: "",
    limit: "",
  });

  const budgets = useQuery(api.budgets.getUserBudgets, { 
    monthYear: selectedMonth 
  });
  const categories = useQuery(api.categories.getUserCategories);
  const setBudget = useMutation(api.budgets.setBudget);
  const deleteBudget = useMutation(api.budgets.deleteBudget);

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

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudget.categoryId || !newBudget.limit) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      await setBudget({
        categoryId: newBudget.categoryId as any,
        monthYear: selectedMonth,
        limit: parseFloat(newBudget.limit),
      });

      toast.success("Orçamento definido com sucesso!");
      setNewBudget({ categoryId: "", limit: "" });
      setShowAddBudget(false);
    } catch (error) {
      toast.error("Erro ao definir orçamento");
      console.error(error);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Tem certeza que deseja deletar este orçamento?")) {
      return;
    }

    try {
      await deleteBudget({ id: budgetId as any });
      toast.success("Orçamento deletado com sucesso!");
    } catch (error) {
      toast.error("Erro ao deletar orçamento");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'caution': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'exceeded': return 'Ultrapassado';
      case 'warning': return 'Atenção';
      case 'caution': return 'Cuidado';
      default: return 'No limite';
    }
  };

  if (!budgets || !categories) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const availableCategories = categories.filter(
    category => !budgets.some(budget => budget.categoryId === category._id)
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6 text-center">
          🎯 Orçamentos
        </h2>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold capitalize">
            {getMonthName(selectedMonth)}
          </h3>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            →
          </button>
        </div>

        {/* Add Budget Button */}
        {availableCategories.length > 0 && (
          <button
            onClick={() => setShowAddBudget(!showAddBudget)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
          >
            {showAddBudget ? "Cancelar" : "➕ Adicionar Orçamento"}
          </button>
        )}

        {/* Add Budget Form */}
        {showAddBudget && (
          <form onSubmit={handleAddBudget} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={newBudget.categoryId}
                onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                {availableCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Salvar Orçamento
            </button>
          </form>
        )}
      </div>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget._id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{budget.category?.icon}</span>
                  <span className="font-semibold">{budget.category?.name}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                  {getStatusText(budget.status)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gasto: {formatCurrency(budget.spent)}</span>
                  <span>Limite: {formatCurrency(budget.limit)}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budget.percentage >= 100 ? 'bg-red-500' :
                      budget.percentage >= 90 ? 'bg-orange-500' :
                      budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{budget.percentage.toFixed(1)}% usado</span>
                  <span>
                    {budget.remaining > 0 
                      ? `Restam ${formatCurrency(budget.remaining)}`
                      : `Excedeu em ${formatCurrency(Math.abs(budget.remaining))}`
                    }
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteBudget(budget._id)}
                className="mt-3 w-full text-red-600 hover:text-red-800 text-sm font-medium py-1"
              >
                Remover Orçamento
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="font-semibold mb-2">Nenhum orçamento definido</h3>
          <p className="text-gray-500 text-sm mb-4">
            Defina orçamentos para suas categorias e acompanhe seus gastos.
          </p>
        </div>
      )}

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-4">Resumo do Mês</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {budgets.length}
              </div>
              <div className="text-sm text-gray-500">Orçamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(budgets.reduce((sum, budget) => sum + budget.spent, 0))}
              </div>
              <div className="text-sm text-gray-500">Total Gasto</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
