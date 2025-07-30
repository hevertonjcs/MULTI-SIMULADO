import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Save, X, RefreshCw } from 'lucide-react';
import userService from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

const AdminPanel = ({ onClose }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    display_name: '',
    company: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await userService.getUsers();
      setUsers(allUsers);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Não foi possível buscar os usuários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.display_name || !newUser.company) {
      toast({ title: "Erro de Validação", description: "Todos os campos são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await userService.addUser(newUser);
      await loadUsers();
      setIsAdding(false);
      setNewUser({ username: '', password: '', display_name: '', company: '' });
      toast({
        title: "Sucesso!",
        description: "Usuário adicionado com sucesso.",
        className: "bg-app-primary text-primary-foreground"
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar usuário",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.id || !editingUser.display_name || !editingUser.company) {
      toast({ title: "Erro de Validação", description: "Nome de exibição e empresa são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { id, username, created_at, updated_at, ...updateData } = editingUser;
      await userService.updateUser(editingUser.id, updateData);
      await loadUsers();
      setEditingUser(null);
      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso.",
        className: "bg-app-primary text-primary-foreground"
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Não foi possível atualizar o usuário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsLoading(true);
    try {
      await userService.deleteUser(userId);
      await loadUsers();
      toast({
        title: "Sucesso!",
        description: "Usuário removido com sucesso.",
        className: "bg-app-primary text-primary-foreground"
      });
    } catch (error) {
      toast({
        title: "Erro ao remover usuário",
        description: error.message || "Não foi possível remover o usuário.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-app-secondary">Painel Administrativo</h2>
        <div className="flex gap-2">
          <Button onClick={loadUsers} variant="outline" size="icon" disabled={isLoading} title="Recarregar usuários">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onClose} variant="outline">Fechar</Button>
        </div>
      </div>

      <Button
        onClick={() => { setIsAdding(true); setEditingUser(null); }}
        className="bg-app-primary hover:bg-app-primary-dark text-white w-full sm:w-auto"
        disabled={isLoading}
      >
        <Plus className="mr-2 h-4 w-4" /> Novo Usuário
      </Button>

      {isAdding && (
        <div className="p-3 sm:p-4 border rounded-lg space-y-4 bg-app-background-light">
          <h3 className="font-semibold text-app-secondary">Novo Usuário</h3>
          <div className="space-y-2">
            <Label htmlFor="new-username">Username</Label>
            <Input
              id="new-username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value.toUpperCase()})}
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-display_name">Nome de Exibição</Label>
            <Input
              id="new-display_name"
              value={newUser.display_name}
              onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-company">Empresa</Label>
            <Input
              id="new-company"
              value={newUser.company}
              onChange={(e) => setNewUser({...newUser, company: e.target.value.toUpperCase()})}
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddUser} className="bg-app-primary text-white" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" /> {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button onClick={() => setIsAdding(false)} variant="outline" disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        </div>
      )}
      
      {editingUser && !isAdding && (
        <div className="p-3 sm:p-4 border rounded-lg space-y-4 bg-app-background-light">
          <h3 className="font-semibold text-app-secondary">Editando Usuário: {editingUser.username}</h3>
           <div className="space-y-2">
            <Label htmlFor="edit-display_name">Nome de Exibição</Label>
            <Input
              id="edit-display_name"
              value={editingUser.display_name}
              onChange={(e) => setEditingUser({...editingUser, display_name: e.target.value})}
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-company">Empresa</Label>
            <Input
              id="edit-company"
              value={editingUser.company}
              onChange={(e) => setEditingUser({...editingUser, company: e.target.value.toUpperCase()})}
              className="input-field"
              disabled={isLoading}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Deixe em branco para não alterar"
              onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleUpdateUser} className="bg-app-primary text-white" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button onClick={() => setEditingUser(null)} variant="outline" disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      <div 
        className="space-y-2 overflow-y-auto pr-2"
        style={{ maxHeight: 'calc(100vh - 450px)', minHeight: '200px' }}
      >
        {isLoading && users.length === 0 && <p className="text-app-muted-foreground text-center py-4">Carregando usuários...</p>}
        {!isLoading && users.length === 0 && <p className="text-app-muted-foreground text-center py-4">Nenhum usuário encontrado.</p>}
        
        {users.map(user => (
          <div 
            key={user.id} 
            className="p-3 sm:p-4 border rounded-lg bg-app-surface shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm sm:text-base text-app-text">{user.username}</p>
                <p className="text-xs sm:text-sm text-app-muted-foreground">{user.display_name}</p>
                <p className="text-xs sm:text-sm text-app-muted-foreground">{user.company}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => { setEditingUser(user); setIsAdding(false); }}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                  title="Editar usuário"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteUser(user.id)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-app-error hover:bg-app-error hover:text-white"
                  disabled={isLoading}
                  title="Remover usuário"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;