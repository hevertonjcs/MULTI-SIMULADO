import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import simulationService from '@/services/simulationService';
import { RefreshCw, Filter, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const COLORS = ['#00C696', '#0088FE', '#FFBB28', '#FF8042', '#A42EFF'];

const AnalyticsPanel = ({ onClose }) => {
  const [analyticsData, setAnalyticsData] = useState({
    simulationsToday: 0,
    averageValue: 0,
    topUser: '',
    installmentDistribution: [],
    userSimulations: [],
    simulationsByType: [],
    userValues: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('all');
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedUser]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const simulations = await simulationService.getSimulations();
      
      // Filtrar por usuário se necessário
      const filteredSimulations = selectedUser === 'all' 
        ? simulations 
        : simulations.filter(sim => sim.user_display_name === selectedUser);

      // Extrair usuários únicos para o filtro
      const users = [...new Set(simulations.map(sim => sim.user_display_name))].filter(Boolean);
      setUniqueUsers(users);

      const today = new Date().toISOString().split('T')[0];

      let todaySimulationsCount = 0;
      const userCounts = {};
      const installmentCounts = {};
      const typeCounts = {};
      const userValueTotals = {};
      const validCreditValues = [];

      filteredSimulations.forEach(sim => {
        if (!sim || typeof sim !== 'object') return;

        if (sim.created_at && new Date(sim.created_at).toISOString().split('T')[0] === today) {
          todaySimulationsCount++;
        }

        const creditValue = Number(sim.credit_value);
        if (typeof sim.credit_value !== 'undefined' && !isNaN(creditValue)) {
          validCreditValues.push(creditValue);
        }
        
        const userName = (typeof sim.user_display_name === 'string' && sim.user_display_name.trim() !== '') 
          ? sim.user_display_name 
          : 'Não Identificado';
        userCounts[userName] = (userCounts[userName] || 0) + 1;
        
        if (typeof sim.credit_value !== 'undefined' && !isNaN(creditValue)) {
          userValueTotals[userName] = (userValueTotals[userName] || 0) + creditValue;
        }
        
        if (sim.installments && Array.isArray(sim.installments)) {
          sim.installments.forEach(inst => {
            if (inst && typeof inst.numParcelas === 'number' && !isNaN(inst.numParcelas)) {
              installmentCounts[inst.numParcelas] = (installmentCounts[inst.numParcelas] || 0) + 1;
            }
          });
        }

        const type = (typeof sim.type === 'string' && sim.type.trim() !== '') ? sim.type : 'Não especificado';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      const avgValue = validCreditValues.length > 0
        ? validCreditValues.reduce((acc, curr) => acc + curr, 0) / validCreditValues.length
        : 0;

      const topUser = Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      setAnalyticsData({
        simulationsToday: todaySimulationsCount,
        averageValue: avgValue,
        topUser,
        installmentDistribution: Object.entries(installmentCounts)
          .map(([installment_count, count]) => ({
            installment_count: parseInt(installment_count),
            count
          }))
          .sort((a, b) => a.installment_count - b.installment_count),
        userSimulations: Object.entries(userCounts)
          .map(([user, count]) => ({
            user,
            count
          }))
          .sort((a, b) => b.count - a.count),
        simulationsByType: Object.entries(typeCounts)
          .map(([name, value]) => ({
            name,
            value
          })),
        userValues: Object.entries(userValueTotals)
          .map(([user, total]) => ({
            user,
            total
          }))
          .sort((a, b) => b.total - a.total)
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setAnalyticsData({
        simulationsToday: 0,
        averageValue: 0,
        topUser: 'Erro',
        installmentDistribution: [],
        userSimulations: [],
        simulationsByType: [],
        userValues: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (resetPassword === '123-456') {
      try {
        await simulationService.deleteAllSimulations();
        fetchAnalytics();
        setIsResetDialogOpen(false);
        setResetPassword('');
      } catch (error) {
        console.error('Erro ao resetar simulações:', error);
      }
    } else {
      alert('Senha incorreta!');
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-100px)] sm:h-[calc(100vh-50px)] w-full rounded-md bg-app-background-light">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-app-secondary">Central de Insights</h2>
          <div className="flex gap-2">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={fetchAnalytics} 
              variant="outline" 
              size="icon" 
              disabled={isLoading} 
              title="Recarregar dados"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setIsResetDialogOpen(true)}
              variant="outline"
              size="icon"
              className="text-red-500 hover:text-red-700"
              title="Resetar dados"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">Fechar</Button>
          </div>
        </div>
        
        {isLoading && <p className="text-app-muted-foreground text-center py-10">Carregando dados da central de insights...</p>}

        {!isLoading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-app-primary/80 to-app-primary/60 p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-1 text-sm text-black opacity-90">Simulações Hoje</h3>
                <p className="text-3xl font-bold text-black">{analyticsData.simulationsToday}</p>
              </div>
              <div className="bg-gradient-to-br from-app-secondary/80 to-app-secondary/60 p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-1 text-sm text-black opacity-90">Média de Valores</h3>
                <p className="text-3xl font-bold text-black">
                  {formatCurrency(analyticsData.averageValue)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/80 to-purple-500/60 p-4 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-1 text-sm text-black opacity-90">Top Usuário</h3>
                <p className="text-3xl font-bold text-black truncate" title={analyticsData.topUser}>{analyticsData.topUser}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-app-surface p-4 rounded-lg shadow-md border border-app-input-border">
                <h3 className="font-semibold mb-3 text-app-secondary">Simulações por Tipo</h3>
                {analyticsData.simulationsByType.length === 0 ? <p className="text-app-muted-foreground text-center py-10">Nenhuma simulação por tipo para exibir.</p> :
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.simulationsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.simulationsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} simulações`, name]}/>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>}
              </div>

              <div className="bg-app-surface p-4 rounded-lg shadow-md border border-app-input-border">
                <h3 className="font-semibold mb-3 text-app-secondary">Distribuição de Parcelas</h3>
                {analyticsData.installmentDistribution.length === 0 ? <p className="text-app-muted-foreground text-center py-10">Nenhuma distribuição de parcelas para exibir.</p> :
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.installmentDistribution} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.5}/>
                      <XAxis dataKey="installment_count" unit="x" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} simulações`, "Quantidade"]}/>
                      <Bar dataKey="count" fill={COLORS[0]} name="Quantidade" barSize={30}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>}
              </div>

              <div className="bg-app-surface p-4 rounded-lg shadow-md border border-app-input-border">
                <h3 className="font-semibold mb-3 text-app-secondary">Simulações por Usuário</h3>
                 {analyticsData.userSimulations.length === 0 ? <p className="text-app-muted-foreground text-center py-10">Nenhuma simulação por usuário para exibir.</p> :
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.userSimulations} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.5}/>
                      <XAxis type="number" />
                      <YAxis dataKey="user" type="category" width={80} />
                      <Tooltip formatter={(value) => [`${value} simulações`, "Simulações"]}/>
                      <Bar dataKey="count" fill={COLORS[1]} name="Simulações" barSize={20}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>}
              </div>

              <div className="bg-app-surface p-4 rounded-lg shadow-md border border-app-input-border">
                <h3 className="font-semibold mb-3 text-app-secondary">Valores Totais por Usuário</h3>
                {analyticsData.userValues.length === 0 ? <p className="text-app-muted-foreground text-center py-10">Nenhum valor total por usuário para exibir.</p> :
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.userValues} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.5}/>
                      <XAxis type="number" tickFormatter={formatCurrency} />
                      <YAxis dataKey="user" type="category" width={80} />
                      <Tooltip formatter={(value) => [formatCurrency(value), "Valor Total"]}/>
                      <Bar dataKey="total" fill={COLORS[2]} name="Valor Total" barSize={20}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>}
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Dados</DialogTitle>
            <DialogDescription>
              Esta ação irá apagar todas as simulações registradas. Digite a senha para confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reset-password">Senha</Label>
            <Input
              id="reset-password"
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Resetar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
};

export default AnalyticsPanel;