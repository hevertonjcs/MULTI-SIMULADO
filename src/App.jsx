import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { motion } from 'framer-motion';
import {
  LogOut,
  Settings,
  BarChart2,
  Paintbrush,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';

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
    <Loader2 className="loading-fallback-icon animate-spin" />
    <p className="loading-fallback-text">{message}</p>
  </div>
);

function App() {
  const { toast } = useToast();

  /* ===============================
     DARK MODE
  ================================ */

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDarkMode(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  /* ===============================
     STATES
  ================================ */

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

  /* ===============================
     SETTINGS
  ================================ */

  const fetchInitialSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const rates = await simulationSettingsService.getSimulationVariables();
      const templateData = await simulationSettingsService.getOutputTemplate();

      setSimulationRates(rates || {});
      setOutputTemplate(templateData?.template || "Template de Saída Padrão");

    } catch (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
      setSimulationRates({});
      setOutputTemplate("Template de Saída Padrão");
    } finally {
      setIsLoadingSettings(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialSettings();
  }, [fetchInitialSettings]);

  /* ===============================
     LOGIN
  ================================ */

  const handleLogin = async (username, password) => {
    setLoginError('');

    if (!username || !password) {
      setLoginError("Usuário e senha são obrigatórios.");
      return false;
    }

    if (loginAttempts >= 5) {
      setLoginError("Muitas tentativas. Tente novamente mais tarde.");
      return false;
    }

    try {
      const user = await userService.verifyCredentials(username, password);

      if (user && user.id) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        setLoginAttempts(0);

        toast({
          title: "Login realizado",
          description: `Bem-vindo, ${user.display_name}`,
        });

        return true;
      } else {
        setLoginAttempts(prev => prev + 1);
        setLoginError("Usuário ou senha inválidos.");
        return false;
      }

    } catch {
      setLoginAttempts(prev => prev + 1);
      setLoginError("Erro durante o login.");
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleSettingsUpdate = useCallback(async () => {
    await fetchInitialSettings();
    toast({
      title: "Configurações atualizadas",
      description: "As novas configurações foram aplicadas.",
    });
  }, [fetchInitialSettings, toast]);

  /* ===============================
     RENDER
  ================================ */

  return (
    <div className="app-container">

      {/* HEADER */}
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

          {/* DARK MODE BUTTON */}
          <Button
            variant="outline"
            onClick={toggleTheme}
            className="header-button hidden md:flex"
            title="Alternar Tema"
          >
            {darkMode ? (
              <Sun className="header-button-icon" />
            ) : (
              <Moon className="header-button-icon" />
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsOutputEditorModalOpen(true)}
            className="header-button"
            title="Editar Saída"
          >
            <Paintbrush className="header-button-icon" />
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsAdminModalOpen(true)}
            className="header-button"
            title="Painel Administrativo"
          >
            <Settings className="header-button-icon" />
          </Button>

        </div>
      </header>

      {/* MAIN */}
      <main className="app-main">

        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="login-screen-container"
          >
            <div className="login-header text-center mb-8">
              <img src="/logo.svg" alt="Logo" className="logo-simulador" width="160" />
              <h1 className="titulo-sistema text-xl sm:text-2xl font-bold">
                SIMULAÇÃO GRUPO ALIENA
              </h1>
            </div>

            <div className="login-form-container">
              <LoginForm onLogin={handleLogin} loginError={loginError} />
            </div>
          </motion.div>

        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="simulation-screen-container"
          >
            <div className="simulation-header">
              <h2 className="simulation-title">
                Simulador - {currentUser?.display_name}
              </h2>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </div>

            {isLoadingSettings ? (
              <LoadingFallback message="Carregando configurações..." />
            ) : (
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
            )}
          </motion.div>
        )}
      </main>

      {/* MODAIS */}

      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <Suspense fallback={<LoadingFallback message="Carregando Admin..." />}>
            {!isAdminLoggedIn ? (
              <AdminLogin
                onLogin={handleAdminLogin}
                onClose={() => setIsAdminModalOpen(false)}
                adminPassword={"2202-2000"}
              />
            ) : (
              <AdminPanel
                onClose={() => {
                  setIsAdminModalOpen(false);
                  setIsAdminLoggedIn(false);
                }}
              />
            )}
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-0">
          <Suspense fallback={<LoadingFallback message="Carregando Analytics..." />}>
            <AnalyticsPanel onClose={() => setIsAnalyticsModalOpen(false)} />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={isOutputEditorModalOpen} onOpenChange={setIsOutputEditorModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <Suspense fallback={<LoadingFallback message="Carregando Editor..." />}>
            <OutputEditorModal
              onClose={() => setIsOutputEditorModalOpen(false)}
              onSettingsUpdate={handleSettingsUpdate}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Sistema de Simulação Nivus.</p>
      </footer>

      <Toaster />
    </div>
  );
}

export default App;
