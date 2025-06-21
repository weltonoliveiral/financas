import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    currency: "BRL",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    notifications: {
      budgetAlerts: true,
      weeklyReports: true,
      monthlyReports: true,
      goalReminders: true,
    },
    privacy: {
      shareData: false,
      analytics: true,
      marketing: false,
    }
  });

  const user = useQuery(api.auth.loggedInUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const exportData = useMutation(api.users.exportUserData);
  const userStats = useQuery(api.users.getUserStats);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        preferences: {
          currency: profileData.currency,
          language: profileData.language,
          timezone: profileData.timezone,
          notifications: profileData.notifications,
          privacy: profileData.privacy,
        }
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
      console.error(error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smarthouse-finance-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar dados");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'Para confirmar a exclusão da conta, digite "DELETAR" (em maiúsculas):'
    );
    
    if (confirmation !== "DELETAR") {
      toast.error("Confirmação incorreta. Conta não foi deletada.");
      return;
    }

    try {
      await deleteAccount();
      toast.success("Conta deletada com sucesso");
    } catch (error) {
      toast.error("Erro ao deletar conta");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", name: "Perfil", icon: "👤" },
    { id: "stats", name: "Estatísticas", icon: "📊" },
    { id: "settings", name: "Configurações", icon: "⚙️" },
    { id: "security", name: "Segurança", icon: "🔒" },
    { id: "data", name: "Dados", icon: "💾" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user.name || "Usuário"}
            </h1>
            <p className="text-blue-100">
              {user.email}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-100">Conta Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Informações do Perfil</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                O email não pode ser alterado por questões de segurança
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moeda
                </label>
                <select
                  value={profileData.currency}
                  onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuso Horário
                </label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              💾 Salvar Alterações
            </button>
          </form>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {userStats ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats.totalExpenses}
                  </div>
                  <div className="text-sm text-gray-500">Total de Despesas</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(userStats.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">Valor Total</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userStats.categoriesUsed}
                  </div>
                  <div className="text-sm text-gray-500">Categorias</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {userStats.daysActive}
                  </div>
                  <div className="text-sm text-gray-500">Dias Ativos</div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Tendências Mensais</h3>
                <div className="space-y-3">
                  {userStats.monthlyTrends.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(month.amount / userStats.maxMonthlyAmount) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(month.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Categorias Mais Usadas</h3>
                <div className="space-y-3">
                  {userStats.topCategories.map((category, index) => (
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
                          {category.count} despesas
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold mb-2">Carregando estatísticas...</h3>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Configurações de Notificação</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Notificações</h3>
              <div className="space-y-3">
                {Object.entries(profileData.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {key === 'budgetAlerts' && 'Alertas de Orçamento'}
                        {key === 'weeklyReports' && 'Relatórios Semanais'}
                        {key === 'monthlyReports' && 'Relatórios Mensais'}
                        {key === 'goalReminders' && 'Lembretes de Metas'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {key === 'budgetAlerts' && 'Receba alertas quando ultrapassar orçamentos'}
                        {key === 'weeklyReports' && 'Resumo semanal dos seus gastos'}
                        {key === 'monthlyReports' && 'Relatório mensal detalhado'}
                        {key === 'goalReminders' && 'Lembretes sobre suas metas de economia'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notifications: {
                            ...profileData.notifications,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Privacidade</h3>
              <div className="space-y-3">
                {Object.entries(profileData.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {key === 'shareData' && 'Compartilhar Dados'}
                        {key === 'analytics' && 'Analytics'}
                        {key === 'marketing' && 'Marketing'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {key === 'shareData' && 'Permitir compartilhamento de dados anonimizados'}
                        {key === 'analytics' && 'Ajudar a melhorar o app com dados de uso'}
                        {key === 'marketing' && 'Receber ofertas e promoções'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          privacy: {
                            ...profileData.privacy,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              💾 Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Segurança da Conta</h2>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="font-medium text-green-800">Conta Verificada</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Sua conta está verificada e protegida
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Autenticação de Dois Fatores</div>
                  <div className="text-sm text-gray-500">
                    Adicione uma camada extra de segurança
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Configurar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Sessões Ativas</div>
                  <div className="text-sm text-gray-500">
                    Gerencie dispositivos conectados
                  </div>
                </div>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                  Ver Sessões
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Alterar Senha</div>
                  <div className="text-sm text-gray-500">
                    Atualize sua senha regularmente
                  </div>
                </div>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                  Alterar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === "data" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Gerenciamento de Dados</h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600">ℹ️</span>
                <span className="font-medium text-blue-800">Seus Dados</span>
              </div>
              <p className="text-sm text-blue-700">
                Você tem controle total sobre seus dados. Exporte, importe ou delete conforme necessário.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Exportar Dados</div>
                  <div className="text-sm text-gray-500">
                    Baixe todos os seus dados em formato JSON
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  📥 Exportar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">Backup Automático</div>
                  <div className="text-sm text-gray-500">
                    Seus dados são salvos automaticamente na nuvem
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Ativo</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="font-medium text-red-800">Zona de Perigo</span>
                  </div>
                  <p className="text-sm text-red-700">
                    As ações abaixo são irreversíveis. Proceda com cuidado.
                  </p>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  🗑️ Deletar Conta Permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
