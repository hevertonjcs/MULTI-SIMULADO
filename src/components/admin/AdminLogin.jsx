import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

const AdminLogin = ({ onLogin, onClose, adminPassword = "2202-2000", title = "Login Administrativo" }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === adminPassword) {
      setError('');
      onLogin();
    } else {
      setError('Senha inválida');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-app-secondary mb-6 text-center">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-password">Senha</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha"
            className="input-field"
          />
        </div>
        {error && <p className="text-app-error text-sm">{error}</p>}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="w-full bg-app-primary hover:bg-app-primary-dark text-white"
          >
            <Lock className="mr-2 h-4 w-4" /> Entrar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;