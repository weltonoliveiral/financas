import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function AddExpense() {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    categoryId: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "",
    description: "",
    tags: "",
  });

  const categories = useQuery(api.categories.getUserCategories);
  const paymentMethods = useQuery(api.paymentMethods.getUserPaymentMethods);
  const addExpense = useMutation(api.expenses.addExpense);
  const createDefaultCategories = useMutation(api.categories.createDefaultCategories);
  const createDefaultPaymentMethods = useMutation(api.paymentMethods.createDefaultPaymentMethods);

  // Initialize default data if needed
  useEffect(() => {
    if (categories && categories.length === 0) {
      createDefaultCategories();
    }
    if (paymentMethods && paymentMethods.length === 0) {
      createDefaultPaymentMethods();
    }
  }, [categories, paymentMethods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.categoryId || !formData.paymentMethod) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await addExpense({
        name: formData.name,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId as any,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        description: formData.description || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      toast.success("Despesa adicionada com sucesso!");
      
      // Reset form
      setFormData({
        name: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "",
        description: "",
        tags: "",
      });
    } catch (error) {
      toast.error("Erro ao adicionar despesa");
      console.error(error);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = (parseInt(numericValue) / 100).toFixed(2);
    return formattedValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCurrency(value);
    setFormData({ ...formData, amount: formatted });
  };

  if (!categories || !paymentMethods) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6 text-center">
          ➕ Adicionar Nova Despesa
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Despesa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Despesa *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Supermercado, Gasolina..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$) *
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={handleAmountChange}
              placeholder="0,00"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pagamento *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione o método</option>
              {paymentMethods.map((method) => (
                <option key={method._id} value={method.name}>
                  {method.icon} {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes adicionais sobre a despesa..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Opcional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Ex: urgente, trabalho, casa (separadas por vírgula)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            💾 Salvar Despesa
          </button>
        </form>

        {/* Quick Add Buttons */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Adição Rápida</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 4).map((category) => (
              <button
                key={category._id}
                onClick={() => setFormData({ ...formData, categoryId: category._id })}
                className="flex items-center justify-center space-x-2 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
