import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("categories");
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "📦",
    color: "#A0A0A0",
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: "",
    icon: "💳",
  });

  const categories = useQuery(api.categories.getUserCategories);
  const paymentMethods = useQuery(api.paymentMethods.getUserPaymentMethods);
  const addCategory = useMutation(api.categories.addCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);
  const addPaymentMethod = useMutation(api.paymentMethods.addPaymentMethod);
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      await addCategory(newCategory);
      toast.success("Categoria adicionada com sucesso!");
      setNewCategory({ name: "", icon: "📦", color: "#A0A0A0" });
    } catch (error) {
      toast.error("Erro ao adicionar categoria");
      console.error(error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) {
      return;
    }

    try {
      await deleteCategory({ id: categoryId as any });
      toast.success("Categoria deletada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar categoria");
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPaymentMethod.name.trim()) {
      toast.error("Nome do método de pagamento é obrigatório");
      return;
    }

    try {
      await addPaymentMethod(newPaymentMethod);
      toast.success("Método de pagamento adicionado com sucesso!");
      setNewPaymentMethod({ name: "", icon: "💳" });
    } catch (error) {
      toast.error("Erro ao adicionar método de pagamento");
      console.error(error);
    }
  };

  const colorOptions = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#A0A0A0",
    "#FF8A80", "#82B1FF", "#B9F6CA", "#FFD54F"
  ];

  const iconOptions = [
    "🍽️", "🚗", "🏠", "⚕️", "📚", "🎮", "👕", "📦",
    "💰", "🎯", "🛒", "⚡", "🎵", "🏋️", "✈️", "🎨"
  ];

  if (!categories || !paymentMethods) {
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
          ⚙️ Configurações
        </h2>

        {/* Section Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveSection("categories")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === "categories"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Categorias
          </button>
          <button
            onClick={() => setActiveSection("payments")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === "payments"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pagamentos
          </button>
        </div>

        {/* Categories Section */}
        {activeSection === "categories" && (
          <div className="space-y-6">
            {/* Add New Category */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4">Adicionar Nova Categoria</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Ex: Pets, Viagem..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewCategory({ ...newCategory, icon })}
                        className={`p-2 text-lg rounded-lg border-2 transition-colors ${
                          newCategory.icon === icon
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          newCategory.color === color
                            ? "border-gray-800 scale-110"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Adicionar Categoria
                </button>
              </form>
            </div>

            {/* Existing Categories */}
            <div>
              <h3 className="font-semibold mb-4">Categorias Existentes</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    {!category.isDefault && (
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Section */}
        {activeSection === "payments" && (
          <div className="space-y-6">
            {/* Add New Payment Method */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4">Adicionar Novo Método</h3>
              <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Método
                  </label>
                  <input
                    type="text"
                    value={newPaymentMethod.name}
                    onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })}
                    placeholder="Ex: Cartão Nubank, Vale Refeição..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {["💳", "💵", "📱", "🏦", "📄", "💰", "🎫", "💎"].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewPaymentMethod({ ...newPaymentMethod, icon })}
                        className={`p-2 text-lg rounded-lg border-2 transition-colors ${
                          newPaymentMethod.icon === icon
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Adicionar Método
                </button>
              </form>
            </div>

            {/* Existing Payment Methods */}
            <div>
              <h3 className="font-semibold mb-4">Métodos Existentes</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{method.icon}</span>
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
