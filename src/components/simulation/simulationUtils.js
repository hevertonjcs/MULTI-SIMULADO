import { formatCurrency, parseCurrency } from '@/lib/utils';

export const buildTelegramMessage = (
  currentResultado, 
  outputTemplate, 
  simulationRates, 
  currentUserDisplay, 
  currentUserCompany, 
  forClipboard = false
) => {
  if (!currentResultado || !outputTemplate || !simulationRates) {
    console.error("Dados insuficientes para buildTelegramMessage:", {currentResultado, outputTemplate, simulationRates});
    return "";
  }

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  
  const activeTabKey = currentResultado.activeTab;
  const isAnual = simulationRates[`${activeTabKey}_isAnual`];
  
  let parcelasList = "";
  currentResultado.simulacoes.forEach(sim => {
    if (isAnual) {
      const anos = Math.floor(sim.numParcelas / 12);
      parcelasList += `${anos}x de ${sim.valorParcela}${forClipboard ? '\n' : '\n'}`; 
    } else {
      parcelasList += `• ${sim.numParcelas}× de ${sim.valorParcela}${forClipboard ? '\n' : '\n'}`; 
    }
  });

  let message = outputTemplate;
  
  message = message.replace(/\\n/g, '\n'); 

  const tipoSimulacao = currentResultado.tipo || ""; 
  message = message.replace(/{TIPO_SIMULACAO}/g, tipoSimulacao.toUpperCase());
  message = message.replace(/{CODIGO_TAXA}/g, currentResultado.codigoTaxa || "");
  message = message.replace(/{DATA_REFERENCIA}/g, formattedDate);
  message = message.replace(/{USUARIO_ATENDIMENTO}/g, currentUserDisplay || "N/A");
  message = message.replace(/{EMPRESA_ATENDIMENTO}/g, currentUserCompany || "N/A");
  
  const nomeBemKey = `${activeTabKey}_nome`;
  const nomeBem = simulationRates[nomeBemKey] ? simulationRates[nomeBemKey].toLowerCase() : "bem";
  message = message.replace(/{NOME_BEM}/g, nomeBem);
  
  message = message.replace(/{VALOR_CREDITO}/g, currentResultado.valorCreditoOriginalDisplay || "N/A");
  message = message.replace(/{ENTRADA_SUGERIDA}/g, currentResultado.entradaSugeridaDisplay || "Nenhuma");
  message = message.replace(/{LISTA_PARCELAS}/g, parcelasList.trim());

  return message;
};


export const calculateSimulationLogic = ({
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
}) => {
  if (!simulationRates) {
    toast({
      title: "Erro de Configuração",
      description: "As configurações da simulação ainda não foram carregadas. Tente novamente em alguns instantes.",
      variant: "destructive",
    });
    return null;
  }

  if (!currentUserId) {
    toast({
      title: "Erro de Identificação do Usuário",
      description: "Não foi possível identificar o usuário para esta simulação.",
      variant: "destructive",
    });
    console.error("calculateSimulationLogic: currentUserId está indefinido.");
    return null;
  }

  const valorFloat = parseCurrency(valorCredito);
  const entradaSugeridaFloat = parseCurrency(entradaSugerida);
  
  if (!valorFloat || valorFloat <= 0) {
    toast({ 
      title: "Erro na Simulação", 
      description: "Informe um valor de crédito válido.",
      variant: "destructive"
    });
    return null;
  }

  let taxaAdm = simulationRates[`${activeTab}_taxaAdm`];
  if ((activeTab === 'taxa' || activeTab === 'anual') && (!taxaPersonalizada || parseFloat(taxaPersonalizada.replace(',', '.')) <= 0)) {
    toast({ 
      title: "Taxa Necessária", 
      description: "Informe uma taxa de juros válida.",
      variant: "destructive"
    });
    return null;
  }
  if (activeTab === 'taxa' || activeTab === 'anual') {
    taxaAdm = parseFloat(taxaPersonalizada.replace(',', '.')) / 100;
  }

  let parcelas = [];
  if (usarParcelasManuais) {
    parcelas = parcelasManuais
      .map(p => parseInt(p))
      .filter(p => p > 0 && !isNaN(p)) 
      .sort((a, b) => a - b);
    
    if (parcelas.length === 0) {
      toast({ 
        title: "Parcelas Inválidas", 
        description: "Informe ao menos uma quantidade de parcelas válida.",
        variant: "destructive"
      });
      return null;
    }
  } else {
    if (!parcelasSelecionadas) {
      toast({ 
        title: "Selecione as Parcelas", 
        description: "Escolha uma opção de parcelamento.",
        variant: "destructive"
      });
      return null;
    }

    const currentParcelasOptions = parcelasOptions[activeTab] || [];
    if (activeTab === 'anual') {
      const selectedOption = currentParcelasOptions.find(opt => opt.value === parcelasSelecionadas);
      if (selectedOption && selectedOption.value) { 
        parcelas = selectedOption.value.split(' ')
          .map(p => parseInt(p.replace('x', '')))
          .filter(p => !isNaN(p) && p > 0); 
      }
    } else {
      parcelas = parcelasSelecionadas.split(' ')
        .map(p => parseInt(p))
        .filter(p => p > 0 && !isNaN(p)); 
    }
  }

  if (parcelas.length === 0) {
    toast({
      title: "Erro nas Parcelas",
      description: "Não foi possível determinar as parcelas para a simulação. Verifique as opções selecionadas.",
      variant: "destructive",
    });
    return null;
  }

  const simulacoes = parcelas.map(numParcelas => {
    const valorTotalComOutrasTaxas = valorFloat * (1 + taxaAdm);
    const saldoRestante = entradaSugeridaFloat > 0 ? valorTotalComOutrasTaxas - entradaSugeridaFloat : valorTotalComOutrasTaxas;
    const valorParcela = saldoRestante / numParcelas;

    return {
      numParcelas,
      valorParcela: formatCurrency(valorParcela)
    };
  });

  const tipoSimulacao = simulationRates[`${activeTab}_nome`] || activeTab;
  
  let codigoTaxaSimulacao;
  if ((activeTab === 'taxa' || activeTab === 'anual') && taxaPersonalizada) {
    const numericTaxa = parseFloat(taxaPersonalizada.replace(',', '.'));
    codigoTaxaSimulacao = !isNaN(numericTaxa) ? `(Cod${String(numericTaxa).padStart(3, '0')})` : (simulationRates[`${activeTab}_cod`] ? `(${simulationRates[`${activeTab}_cod`]})` : '');
  } else {
    codigoTaxaSimulacao = simulationRates[`${activeTab}_cod`] ? `(${simulationRates[`${activeTab}_cod`]})` : '';
  }


  return {
    tipo: tipoSimulacao,
    valorCreditoOriginal: valorFloat,
    valorCreditoOriginalDisplay: formatCurrency(valorFloat),
    entradaSugerida: entradaSugeridaFloat,
    entradaSugeridaDisplay: entradaSugeridaFloat > 0 ? formatCurrency(entradaSugeridaFloat) : null,
    simulacoes,
    taxaPersonalizada: (activeTab === 'taxa' || activeTab === 'anual') ? taxaPersonalizada : null,
    codigoTaxa: codigoTaxaSimulacao,
    activeTab,
    user_display_name: currentUserDisplay,
    company: currentUserCompany,
    user_id: currentUserId, 
    credit_value: valorFloat, 
    installments: simulacoes 
  };
};