import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { PARCELAS_OPTIONS as DEFAULT_PARCELAS_OPTIONS } from '@/config/constants';
import SimulationTabs from '@/components/simulation/SimulationTabs';
import SimulationResult from '@/components/simulation/SimulationResult';
import SimulationInputs from '@/components/simulation/SimulationInputs';
import InstallmentOptions from '@/components/simulation/InstallmentOptions';
import CustomRateInput from '@/components/simulation/CustomRateInput';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import simulationService from '@/services/simulationService';
import { buildTelegramMessage, calculateSimulationLogic } from '@/components/simulation/simulationUtils';

const SimulationForm = React.memo(({ 
  currentUserDisplay, 
  currentUserCompany, 
  currentUserId,
  botToken, 
  chatId, 
  toast,
  initialSimulationRates,
  initialOutputTemplate
}) => {
  const [activeTab, setActiveTab] = useState('auto');
  const [valorCredito, setValorCredito] = useState('');
  const [entradaSugerida, setEntradaSugerida] = useState('');
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState('');
  const [resultado, setResultado] = useState(null);
  const [taxaPersonalizada, setTaxaPersonalizada] = useState('');
  const [parcelasManuais, setParcelasManuais] = useState(['']);
  const [usarParcelasManuais, setUsarParcelasManuais] = useState(false);

  const [simulationRates, setSimulationRates] = useState(initialSimulationRates);
  const [outputTemplate, setOutputTemplate] = useState(initialOutputTemplate);
  const [parcelasOptions, setParcelasOptions] = useState(DEFAULT_PARCELAS_OPTIONS);

  useEffect(() => {
    setSimulationRates(initialSimulationRates);
  }, [initialSimulationRates]);

  useEffect(() => {
    setOutputTemplate(initialOutputTemplate);
  }, [initialOutputTemplate]);

  const valorCreditoRef = useRef(null);
  const entradaSugeridaRef = useRef(null);

  const handleValorChange = useCallback((value) => {
    setValorCredito(value);
  }, []);

  const handleEntradaChange = useCallback((value) => {
    setEntradaSugerida(value);
  }, []);

  const memoizedBuildTelegramMessage = useCallback((currentResultado, forClipboard = false) => {
    return buildTelegramMessage(
      currentResultado, 
      outputTemplate, 
      simulationRates, 
      currentUserDisplay, 
      currentUserCompany, 
      forClipboard
    );
  }, [outputTemplate, simulationRates, currentUserDisplay, currentUserCompany]);

  const handleCopyToClipboard = useCallback((resultadoParaCopiar) => {
    if (!resultadoParaCopiar) return;
    
    const messageToCopy = memoizedBuildTelegramMessage(resultadoParaCopiar, true); 
    if (!messageToCopy) {
      toast({ 
        title: "Erro ao Copiar", 
        description: "Não foi possível gerar a mensagem da simulação.",
        variant: "destructive"
      });
      return;
    }
    navigator.clipboard.writeText(messageToCopy)
      .then(() => {
        toast({ 
          title: "Copiado!", 
          description: "Resultado da simulação copiado para a área de transferência.",
          className: "bg-app-primary text-primary-foreground"
        });
      })
      .catch(err => {
        console.error('Erro ao copiar texto: ', err);
        toast({ 
          title: "Erro ao Copiar", 
          description: "Não foi possível copiar o resultado.",
          variant: "destructive"
        });
      });
  }, [toast, memoizedBuildTelegramMessage]);

  const handleSendToTelegram = useCallback(async (resultadoParaEnviar) => {
    if (!resultadoParaEnviar) return;

    const message = memoizedBuildTelegramMessage(resultadoParaEnviar, false); 
    if (!message) {
      toast({ 
        title: "Erro no Envio", 
        description: "Não foi possível gerar a mensagem da simulação para envio.",
        variant: "destructive"
      });
      return;
    }
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API Error:', errorData);
        throw new Error(errorData.description || 'Erro ao enviar mensagem');
      }
      
      toast({ 
        title: "Enviado!", 
        description: "Simulação enviada para o Telegram com sucesso.",
        className: "bg-app-primary text-primary-foreground"
      });
    } catch (error) {
      console.error('Erro ao enviar para o Telegram:', error);
      toast({ 
        title: "Erro no Envio", 
        description: `Não foi possível enviar a simulação para o Telegram. Detalhe: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [toast, botToken, chatId, memoizedBuildTelegramMessage]);

  const calcularSimulacao = useCallback(() => {
    if (!currentUserId) {
      toast({
        title: "Erro de Identificação",
        description: "ID do usuário não encontrado. Não é possível salvar a simulação.",
        variant: "destructive",
      });
      console.error("currentUserId está indefinido ao tentar calcular simulação.");
      return;
    }

    const novoResultado = calculateSimulationLogic({
      activeTab,
      valorCredito,
      entradaSugerida,
      taxaPersonalizada,
      usarParcelasManuais,
      parcelasManuais,
      parcelasSelecionadas,
      simulationRates,
      parcelasOptions,
      currentUserDisplay,
      currentUserCompany,
      currentUserId,
      toast
    });

    if (novoResultado) {
      setResultado(novoResultado);
      simulationService.saveSimulation(novoResultado)
        .then(() => {
          handleSendToTelegram(novoResultado);
          handleCopyToClipboard(novoResultado);
        })
        .catch(error => {
          toast({
            title: "Erro ao Salvar",
            description: "Não foi possível salvar a simulação. Verifique o console para mais detalhes.",
            variant: "destructive"
          });
          console.error("Erro ao salvar simulação no service:", error);
        });
    }
  }, [
    activeTab, valorCredito, entradaSugerida, taxaPersonalizada, usarParcelasManuais, 
    parcelasManuais, parcelasSelecionadas, simulationRates, parcelasOptions, 
    currentUserDisplay, currentUserCompany, currentUserId, toast, 
    handleSendToTelegram, handleCopyToClipboard
  ]);

  if (!simulationRates || !outputTemplate) {
    return <p className="text-center text-app-muted-foreground">Carregando formulário de simulação...</p>;
  }

  return (
    <div className="space-y-6">
      <SimulationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="space-y-4">
        <SimulationInputs
          valorCredito={valorCredito}
          handleValorChange={handleValorChange}
          entradaSugerida={entradaSugerida}
          handleEntradaChange={handleEntradaChange}
          valorCreditoRef={valorCreditoRef}
          entradaSugeridaRef={entradaSugeridaRef}
        />

        <InstallmentOptions
          tabKey={activeTab}
          usarParcelasManuais={usarParcelasManuais}
          setUsarParcelasManuais={setUsarParcelasManuais}
          parcelasManuais={parcelasManuais}
          setParcelasManuais={setParcelasManuais}
          parcelasSelecionadas={parcelasSelecionadas}
          setParcelasSelecionadas={setParcelasSelecionadas}
          parcelasOptions={parcelasOptions}
        />

        {(activeTab === 'taxa' || activeTab === 'anual') && (
          <CustomRateInput
            taxaPersonalizada={taxaPersonalizada}
            setTaxaPersonalizada={setTaxaPersonalizada}
          />
        )}

        <Button 
          onClick={calcularSimulacao}
          className="w-full bg-app-primary hover:bg-app-primary-dark text-primary-foreground font-semibold py-3 transition-all duration-300"
          aria-label="Calcular Simulação"
        >
          <Calculator className="mr-2 h-5 w-5" /> Calcular Simulação
        </Button>
      </div>

      <SimulationResult
        resultado={resultado}
        onSendToTelegram={handleSendToTelegram}
        buildTelegramMessage={(res, forClipboard) => memoizedBuildTelegramMessage(res, forClipboard)}
        toast={toast}
        simulationRates={simulationRates}
      />
    </div>
  );
});

SimulationForm.displayName = 'SimulationForm';
export default SimulationForm;