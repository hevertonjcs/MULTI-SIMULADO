import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { LogIn, AlertCircle } from 'lucide-react';

    const LoginForm = ({ onLogin, loginError }) => {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [isLoading, setIsLoading] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await onLogin(username, password);
        setIsLoading(false);
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-6 login-form">
          <div className="space-y-2 input-group">
            <Label htmlFor="username-login" className="text-app-secondary font-medium">Usuário</Label>
            <Input 
              id="username-login" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Seu usuário" 
              className="bg-app-surface border-app-input-border text-app-text focus:ring-app-primary focus:border-app-primary" 
              required 
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2 input-group">
            <Label htmlFor="password-login" className="text-app-secondary font-medium">Senha</Label>
            <Input 
              id="password-login" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Sua senha" 
              className="bg-app-surface border-app-input-border text-app-text focus:ring-app-primary focus:border-app-primary" 
              required 
              disabled={isLoading}
            />
          </div>
          {loginError && (
            <p className="error-message text-app-error text-sm flex items-center">
              <AlertCircle size={16} className="mr-1" /> {loginError}
            </p>
          )}
          <Button 
            type="submit" 
            className="w-full bg-app-primary hover:bg-app-primary-dark text-white font-semibold py-3 transition-all duration-300 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : <><LogIn className="mr-2 h-5 w-5" /> Entrar</>}
          </Button>
        </form>
      );
    };

    export default LoginForm;