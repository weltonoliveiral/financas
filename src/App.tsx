import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import AddExpense from "./components/AddExpense";
import Reports from "./components/Reports";
import Budgets from "./components/Budgets";
import Settings from "./components/Settings";
import UserProfile from "./components/UserProfile";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Authenticated>
        <SmartHouseFinanceApp />
      </Authenticated>
      <Unauthenticated>
        <ElegantLoginScreen />
      </Unauthenticated>
      <Toaster />
    </div>
  );
}

function ElegantLoginScreen() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-md transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 rounded-3xl shadow-2xl">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <span className="text-4xl">💰</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                SmartHouse
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Finance
              </span>
            </h1>
            
            <p className="text-gray-300 text-lg font-light leading-relaxed">
              Transforme sua relação com o dinheiro
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Controle inteligente e elegante das suas finanças
            </p>
          </div>

          {/* Login Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-3">
                  Bem-vindo de volta
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Entre com sua conta para acessar seu painel financeiro personalizado
                </p>
              </div>
              
              <SignInForm />
              
              {/* Security Badge */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-300 font-medium">Conexão Segura</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                    <span className="text-xs">🔒</span>
                    <span className="text-xs text-gray-300 font-medium">Dados Protegidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
                <div className="text-white font-semibold mb-1">Analytics</div>
                <div className="text-gray-400 text-xs">Insights inteligentes</div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <div className="text-white font-semibold mb-1">Metas</div>
                <div className="text-gray-400 text-xs">Objetivos personalizados</div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <div className="text-white font-semibold mb-1">Automação</div>
                <div className="text-gray-400 text-xs">Controle automático</div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🚀</div>
                <div className="text-white font-semibold mb-1">Crescimento</div>
                <div className="text-gray-400 text-xs">Evolução financeira</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 text-gray-400 text-xs">
              <span>✨</span>
              <span>Desenvolvido com paixão para sua prosperidade</span>
              <span>✨</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              © 2024 SmartHouse Finance - Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmartHouseFinanceApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const tabs = [
    { id: "dashboard", name: "Visão Geral", icon: "📊" },
    { id: "add", name: "Adicionar", icon: "➕" },
    { id: "reports", name: "Relatórios", icon: "📈" },
    { id: "budgets", name: "Orçamentos", icon: "🎯" },
    { id: "profile", name: "Perfil", icon: "👤" },
    { id: "settings", name: "Configurações", icon: "⚙️" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "add":
        return <AddExpense />;
      case "reports":
        return <Reports />;
      case "budgets":
        return <Budgets />;
      case "profile":
        return <UserProfile />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-blue-600">SmartHouse Finance</h1>
            <p className="text-xs text-gray-500">
              Olá, {loggedInUser?.name || loggedInUser?.email?.split('@')[0] || 'usuário'}!
            </p>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="text-lg mb-1">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
