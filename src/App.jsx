import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { motion } from 'framer-motion';
import { LogOut, Settings, BarChart2, Paintbrush, Loader2 } from 'lucide-react';
import LoginForm from '@/components/LoginForm';
import SimulationForm from '@/components/simulation/SimulationForm'; 
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BOT_TOKEN, CHAT_ID } from '@/config/constants';
import userService from '@/services/userService';
import simulationSettingsService from '@/services/simulationSettingsService';

const AdminLogin = React.lazy(() => import('@/components/admin/AdminLogin'));
const AdminPanel = React.lazy(() => import('@/components/admin/AdminPanel'));
const AnalyticsPanel = React.lazy(() => import('@/components/analytics/AnalyticsPanel'));
const OutputEditorModal = React.lazy(() => import('@/components/admin/OutputEditorModal'));

const LoadingFallback = ({ message = "Carregando..." }) => (
  <div className="loading-fallback">
    <Loader2 className="loading-fallback-icon" />
    <p className="loading-fallback-text">{message}</p>
  </div>
);

function App() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginError, setLoginError] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isOutputEditorModalOpen, setIsOutputEditorModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [simulationRates, setSimulationRates] = useState(null);
  const [outputTemplate, setOutputTemplate] = useState(null); 
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const fetchInitialSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const rates = await simulationSettingsService.getSimulationVariables();
      const templateData = await simulationSettingsService.getOutputTemplate();
      
      if (!rates || Object.keys(rates).length === 0) {
        console.warn("Taxas de simulação não carregadas ou vazias.");
        toast({
            title: "Aviso de Configuração",
            description: "As taxas de simulação base não foram carregadas. Usando padrões.",
            variant: "default", 
        });
      }
      setSimulationRates(rates || {}); 

      if (!templateData || !templateData.template) {
        console.warn("Template de saída não carregado ou vazio.");
        toast({
            title: "Aviso de Configuração",
            description: "O template de saída não foi carregado. Usando padrão.",
            variant: "default",
        });
      }
      setOutputTemplate(templateData?.template || "Template de Saída Padrão: {TIPO_SIMULACAO} etc.");


    } catch (error) {
      console.error("Error fetching initial settings:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações iniciais da simulação. Algumas funcionalidades podem não estar disponíveis.",
        variant: "destructive",
      });
      setSimulationRates({}); 
      setOutputTemplate("Template de Saída Padrão: {TIPO_SIMULACAO} etc."); 
    } finally {
      setIsLoadingSettings(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialSettings();
  }, [fetchInitialSettings]);

  const handleLogin = async (username, password) => {
    setLoginError(''); 
    if (!username || !password) {
      setLoginError("Usuário e senha são obrigatórios.");
      toast({ title: "Erro de Login", description: "Usuário e senha são obrigatórios.", variant: "destructive" });
      return false;
    }
    if (loginAttempts >= 5) { 
      const newError = "Muitas tentativas de login. Tente novamente mais tarde.";
      setLoginError(newError);
      toast({ title: "Erro de Login", description: newError, variant: "destructive" });
      return false;
    }

    try {
      const user = await userService.verifyCredentials(username, password);
      if (user && user.id) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        setLoginAttempts(0);
        setLoginError('');
        toast({ title: "Login bem-sucedido!", description: `Bem-vindo, ${user.display_name}!`, className: "toast-success-custom" });
        return true;
      } else {
        setLoginAttempts(prev => prev + 1);
        const newError = "Usuário ou senha inválidos.";
        setLoginError(newError);
        toast({ title: "Erro de Login", description: newError, variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginAttempts(prev => prev + 1);
      const newError = "Ocorreu um erro durante o login. Tente novamente.";
      setLoginError(newError);
      toast({ title: "Erro de Login", description: newError, variant: "destructive" });
      return false;
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginAttempts(0);
    setLoginError('');
    setIsAdminLoggedIn(false); 
    toast({ title: "Logout", description: "Você saiu do sistema.", className: "toast-success-custom" });
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    toast({ 
      title: "Admin Login", 
      description: "Login administrativo realizado com sucesso!", 
      className: "toast-success-custom" 
    });
  };

  const handleSettingsUpdate = useCallback(async () => {
    await fetchInitialSettings(); 
    toast({
      title: "Configurações Atualizadas",
      description: "As configurações da simulação foram recarregadas.",
      className: "toast-success-custom",
    });
  }, [fetchInitialSettings, toast]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAnalyticsModalOpen(true)}
            className="header-button"
            title="Central de Insights"
          >
            <BarChart2 className="header-button-icon" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOutputEditorModalOpen(true)}
            className="header-button group"
            title="Editar Saída da Simulação"
          >
            <Paintbrush className="header-button-icon group-hover:scale-110" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAdminModalOpen(true)}
            className="header-button group"
            title="Painel Administrativo"
          >
            <Settings className="header-button-icon group-hover:scale-110" />
          </Button>
        </div>
      </header>

      <main className="app-main">
        {!isLoggedIn ? (
          <motion.div 
            key="login-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="login-screen-container"
          >
            <div className="login-header text-center mb-8">
              <img
                src="https://i.ibb.co/7x3XwFZd/multinegociacoes-logo-com-borda.png"
                alt="Logomarca Multinegociações"
                className="logo-simulador"
                loading="lazy" 
                width="160"
                height="auto"
              />
              <h1 className="titulo-sistema text-xl sm:text-2xl font-bold text-app-secondary">SISTEMA DE SIMULAÇÃO</h1>
            </div>
            <div className="login-form-container">
              <LoginForm onLogin={handleLogin} loginError={loginError} />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="simulation-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="simulation-screen-container"
          >
            <div className="simulation-header">
              <h2 className="simulation-title">
                Simulador - <span className="text-app-primary">{currentUser?.display_name || 'Usuário'}</span>
              </h2>
              <Button variant="outline" onClick={handleLogout} className="logout-button">
                <LogOut className="mr-2 h-4 w-4"/> Sair
              </Button>
            </div>
            {isLoadingSettings ? (
               <LoadingFallback message="Carregando configurações da simulação..." />
            ) : simulationRates && outputTemplate !== null ? ( 
              <SimulationForm 
                currentUserDisplay={currentUser?.display_name}
                currentUserCompany={currentUser?.company}
                currentUserId={currentUser?.id}
                botToken={BOT_TOKEN} 
                chatId={CHAT_ID}
                toast={toast}
                initialSimulationRates={simulationRates}
                initialOutputTemplate={outputTemplate}
              />
            ) : (
              <div className="settings-error-container">
                <Settings className="settings-error-icon" />
                <p className="settings-error-title">Erro ao Carregar Configurações</p>
                <p className="settings-error-message">Não foi possível carregar os dados necessários para a simulação. <br/>Tente recarregar a página ou contate o suporte.</p>
                <Button onClick={fetchInitialSettings} className="settings-error-button">Tentar Novamente</Button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="dialog-content sm:max-w-[600px]">
          <Suspense fallback={<LoadingFallback message="Carregando Painel Admin..." />}>
            {!isAdminLoggedIn ? (
              <AdminLogin 
                onLogin={handleAdminLogin}
                onClose={() => setIsAdminModalOpen(false)}
                adminPassword={"2202-2000"}
              />
            ) : (
              <AdminPanel onClose={() => { setIsAdminModalOpen(false); setIsAdminLoggedIn(false); }} />
            )}
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="dialog-content sm:max-w-[800px] p-0">
          <Suspense fallback={<LoadingFallback message="Carregando Analytics..." />}>
            <AnalyticsPanel onClose={() => setIsAnalyticsModalOpen(false)} />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={isOutputEditorModalOpen} onOpenChange={setIsOutputEditorModalOpen}>
        <DialogContent className="dialog-content sm:max-w-[700px]">
          <Suspense fallback={<LoadingFallback message="Carregando Editor de Saída..." />}>
            <OutputEditorModal 
              onClose={() => setIsOutputEditorModalOpen(false)} 
              onSettingsUpdate={handleSettingsUpdate}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Sistema de Simulação. Todos os direitos reservados.</p>
        <p className="mt-1">Desenvolvido com <span role="img" aria-label="coração">❤️</span> por Hostinger Horizons</p>
      </footer>

      <Toaster />
    </div>
  );
}

export default App;