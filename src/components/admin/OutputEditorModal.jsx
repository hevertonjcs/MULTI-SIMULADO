import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Save, X, Loader2, Info } from 'lucide-react';
import AdminLogin from '@/components/admin/AdminLogin';
import simulationSettingsService from '@/services/simulationSettingsService';

const OutputEditorModal = ({ onClose, onSettingsUpdate }) => {
  const { toast } = useToast();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [outputTemplate, setOutputTemplate] = useState('');
  const [simulationVariables, setSimulationVariables] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialVariables, setInitialVariables] = useState({});

  const adminPassword = "2202-2000";

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadSettings();
    }
  }, [isAdminAuthenticated]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const templateData = await simulationSettingsService.getOutputTemplate();
      setOutputTemplate(templateData.template ? templateData.template.replace(/\\n/g, '\n') : '');
      const variablesData = await simulationSettingsService.getSimulationVariables();
      setSimulationVariables(variablesData || {});
      setInitialVariables(JSON.parse(JSON.stringify(variablesData || {}))); 
    } catch (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message || "Não foi possível buscar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const templateToSave = outputTemplate.replace(/\n/g, '\\n');
      await simulationSettingsService.updateOutputTemplate(templateToSave);
      
      if (showAdvanced) {
        await simulationSettingsService.updateSimulationVariables(simulationVariables);
      } else {
        await simulationSettingsService.updateSimulationVariables(initialVariables);
      }
      toast({
        title: "Sucesso!",
        description: "Alterações salvas com sucesso.",
        className: "bg-app-primary text-primary-foreground",
      });
      onSettingsUpdate(); 
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableChange = (key, value) => {
    let parsedValue = value;
    if (key.endsWith('_taxaAdm')) {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    } else if (key.endsWith('_isAnual')) {
      parsedValue = value === 'true';
    }
    setSimulationVariables(prev => ({ ...prev, [key]: parsedValue }));
  };

  if (!isAdminAuthenticated) {
    return (
      <AdminLogin 
        onLogin={handleAdminLogin} 
        onClose={onClose} 
        adminPassword={adminPassword}
        title="Editar Saída da Simulação"
      />
    );
  }

  const variableLabels = {
    auto_taxaAdm: "Taxa Adm. Automóvel (%)",
    moto_taxaAdm: "Taxa Adm. Moto (%)",
    pesados_taxaAdm: "Taxa Adm. Pesados (%)",
    imovel_taxaAdm: "Taxa Adm. Imóvel (%)",
    especial_taxaAdm: "Taxa Adm. Especial (%)",
    auto_cod: "Cód. Automóvel",
    moto_cod: "Cód. Moto",
    pesados_cod: "Cód. Pesados",
    imovel_cod: "Cód. Imóvel",
    especial_cod: "Cód. Especial",
    anual_isAnual: "Anual é Anual (true/false)",
    auto_nome: "Nome Automóvel",
    moto_nome: "Nome Moto",
    pesados_nome: "Nome Pesados",
    imovel_nome: "Nome Imóvel",
    especial_nome: "Nome Especial",
    anual_nome: "Nome Anual",
  };

  return (
    <div className="p-6 bg-app-surface rounded-2xl shadow-lg max-h-[80vh] flex flex-col">
      <h2 className="text-2xl font-bold text-app-secondary mb-6 text-center">Editor de Saída da Simulação</h2>
      
      {isLoading && !outputTemplate && Object.keys(simulationVariables).length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-app-primary" />
          <p className="ml-2 text-app-muted-foreground">Carregando configurações...</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
          <div>
            <Label htmlFor="output-template" className="text-app-secondary font-semibold">Template da Mensagem de Saída</Label>
            <Textarea
              id="output-template"
              value={outputTemplate}
              onChange={(e) => setOutputTemplate(e.target.value)}
              rows={10}
              className="mt-1 w-full input-field text-sm"
              placeholder="Edite o template da mensagem aqui. Use {VARIAVEL} para placeholders e quebras de linha reais."
            />
            <p className="text-xs text-app-muted-foreground mt-1">
              Placeholders disponíveis: {`{TIPO_SIMULACAO}, {CODIGO_TAXA}, {DATA_REFERENCIA}, {USUARIO_ATENDIMENTO}, {EMPRESA_ATENDIMENTO}, {NOME_BEM}, {VALOR_CREDITO}, {ENTRADA_SUGERIDA}, {LISTA_PARCELAS}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="advanced-options"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor="advanced-options" className="text-app-secondary font-medium">
              Avançado: permitir edição das variáveis
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-app-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="bg-app-surface text-app-text border-app-input-border">
                  <p>Permite alterar parâmetros internos da simulação. Use com cautela.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {showAdvanced && (
            <div className="space-y-4 p-4 border border-app-input-border rounded-lg bg-app-background-light">
              <h3 className="text-lg font-semibold text-app-secondary mb-2">Variáveis da Simulação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(simulationVariables).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`var-${key}`} className="text-sm font-medium text-app-text">
                      {variableLabels[key] || key}
                    </Label>
                    <Input
                      id={`var-${key}`}
                      type={typeof value === 'number' ? 'number' : (key.endsWith('_isAnual') ? 'text' : 'text')}
                      value={value === null || value === undefined ? '' : String(value)}
                      onChange={(e) => handleVariableChange(key, e.target.value)}
                      className="input-field text-sm"
                      step={key.endsWith('_taxaAdm') ? "0.01" : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-8 pt-4 border-t border-app-input-border">
        <Button
          onClick={handleSaveChanges}
          className="w-full bg-app-primary hover:bg-app-primary-dark text-white"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full"
          disabled={isLoading}
        >
          <X className="mr-2 h-4 w-4" /> Cancelar
        </Button>
      </div>
    </div>
  );
};

export default OutputEditorModal;