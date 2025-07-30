import React, { useState, useEffect, useRef } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { motion } from 'framer-motion';
    import { Car, Home, Truck, Percent, Calculator, Send, Info, PlusCircle, XCircle } from 'lucide-react';
    import { PARCELAS_OPTIONS, SIMULATION_RATES } from '@/config/constants';

    const applyMask = (element) => {
      if (element && typeof window.$ === 'function' && typeof window.$.fn.mask === 'function') {
        window.$(element).unmask().mask('#.##0,00', { reverse: true });
      }
    };
    
    const removeMask = (element) => {
      if (element && typeof window.$ === 'function' && typeof window.$.fn.unmask === 'function') {
        window.$(element).unmask();
      }
    };

    const SimulationForm = ({ currentUser, botToken, chatId, toast, formatCurrency, parseCurrency }) => {
      const [activeTab, setActiveTab] = useState('auto');
      const [valorCreditoOuParcela, setValorCreditoOuParcela] = useState('');
      const [parcelasSelecionadas, setParcelasSelecionadas] = useState(''); 
      const [resultado, setResultado] = useState(null);
      const [tipoCalculo, setTipoCalculo] = useState('credito');
      const [taxaPersonalizada, setTaxaPersonalizada] = useState('');
      
      const [parcelasManuais, setParcelasManuais] = useState(['']);
      const [usarParcelasManuais, setUsarParcelasManuais] = useState(false);
      const [entradaSugerida, setEntradaSugerida] = useState('');

      const valorCreditoOuParcelaRef = useRef(null);
      const entradaSugeridaRef = useRef(null);

      useEffect(() => {
        applyMask(valorCreditoOuParcelaRef.current);
      }, [activeTab, tipoCalculo]); 
      
      useEffect(() => {
        applyMask(entradaSugeridaRef.current);
      }, [activeTab]);

      const handleInputChangeWithMask = (value, setter) => {
        setter(value);
      };

      const resetSimulation = () => {
        setValorCreditoOuParcela('');
        setParcelasSelecionadas('');
        setResultado(null);
        setTaxaPersonalizada('');
        setParcelasManuais(['']);
        setUsarParcelasManuais(false);
        setEntradaSugerida('');
        if (valorCreditoOuParcelaRef.current) valorCreditoOuParcelaRef.current.value = '';
        if (entradaSugeridaRef.current) entradaSugeridaRef.current.value = '';
        
        applyMask(valorCreditoOuParcelaRef.current);
        applyMask(entradaSugeridaRef.current);

      };

      const handleParcelasManuaisChange = (index, value) => {
        const newParcelasManuais = [...parcelasManuais];
        newParcelasManuais[index] = value;
        setParcelasManuais(newParcelasManuais);
      };
    
      const addParcelaManualInput = () => {
        if (parcelasManuais.length < 5) {
          setParcelasManuais([...parcelasManuais, '']);
        }
      };
    
      const removeParcelaManualInput = (index) => {
        if (parcelasManuais.length > 1) {
          const newParcelasManuais = parcelasManuais.filter((_, i) => i !== index);
          setParcelasManuais(newParcelasManuais);
        }
      };

      const getTaxaCode = (tab, taxaAdmValue) => {
        if (tab === 'taxa' && taxaAdmValue) {
          const taxaPercent = parseFloat(taxaAdmValue);
          if (!isNaN(taxaPercent)) {
            return `(Cód. ${String(taxaPercent).padStart(3, '0')})`;
          }
        }
        const rateInfo = SIMULATION_RATES[tab];
        return rateInfo?.cod ? `(Cód. ${rateInfo.cod})` : '';
      };
      
      const calcularVariacoesParcela = (valorParcelaBase, numParcelasCalculadas, currentTaxaAdm, rates) => {
        const variacoes = [];
        const percentuais = [-0.30, 0.40]; 
        const labels = ["Parcela 30% Menor", "Parcela 40% Maior"];

        percentuais.forEach((percent, index) => {
          const valorParcelaVariada = valorParcelaBase * (1 + percent);
          const valorCreditoEstimado = (valorParcelaVariada * numParcelasCalculadas) / (1 + currentTaxaAdm + rates.fundoReserva + rates.seguro);
          
          variacoes.push({
            label: labels[index],
            valorParcela: formatCurrency(valorParcelaVariada),
            valorCredito: formatCurrency(valorCreditoEstimado),
            numParcelas: numParcelasCalculadas
          });
        });
        return variacoes;
      };

      const calcularSimulacao = () => {
        const valorInputFloat = parseCurrency(valorCreditoOuParcelaRef.current ? valorCreditoOuParcelaRef.current.value : valorCreditoOuParcela);
        const entradaSugeridaFloat = parseCurrency(entradaSugeridaRef.current ? entradaSugeridaRef.current.value : entradaSugerida);

        let numParcelasArray = [];

        if (usarParcelasManuais) {
          numParcelasArray = parcelasManuais.map(p => parseInt(p)).filter(p => !isNaN(p) && p > 0);
          if (numParcelasArray.length === 0) {
            toast({ title: "Erro de Cálculo", description: "Por favor, insira pelo menos um número de parcelas manual válido.", variant: "destructive" });
            setResultado(null);
            return;
          }
        } else {
          const pSel = parseInt(parcelasSelecionadas);
          if (isNaN(pSel) || pSel <= 0) {
             toast({ title: "Erro de Cálculo", description: "Por favor, selecione uma opção de parcelas válida.", variant: "destructive" });
             setResultado(null);
             return;
          }
          numParcelasArray = [pSel];
        }
        
        let currentTaxaAdm = SIMULATION_RATES[activeTab]?.taxaAdm;

        if (activeTab === 'taxa') {
          const taxaInput = parseFloat(taxaPersonalizada);
          if (isNaN(taxaInput) || taxaInput <= 0) {
            toast({ title: "Erro de Cálculo", description: "Por favor, insira uma taxa personalizada válida.", variant: "destructive" });
            setResultado(null);
            return;
          }
          currentTaxaAdm = taxaInput / 100;
        }

        if (isNaN(valorInputFloat) || valorInputFloat <= 0) {
          toast({ title: "Erro de Cálculo", description: "Por favor, insira um valor de crédito/parcela válido.", variant: "destructive" });
          setResultado(null);
          return;
        }
        
        const rates = SIMULATION_RATES[activeTab];
        if (!rates) {
            toast({ title: "Erro de Configuração", description: "Configurações não encontradas para este tipo de simulação.", variant: "destructive" });
            return;
        }
        const { fundoReserva, seguro, nome } = rates;
        
        const totalTaxasAdministrativas = currentTaxaAdm + fundoReserva; 
        
        const resultadosIndividuais = numParcelasArray.map(numParcelasInput => {
          let valorFinalCredito = valorInputFloat;
          let valorFinalParcela;
          let variacoesParcela = null;
          
          if (tipoCalculo === 'credito') {
            const valorComTaxas = valorInputFloat * (1 + totalTaxasAdministrativas);
            const valorComSeguro = valorComTaxas + (valorInputFloat * seguro);
            valorFinalParcela = valorComSeguro / numParcelasInput;
          } else { 
            const valorParcelaDesejada = valorInputFloat;
            valorFinalCredito = (valorParcelaDesejada * numParcelasInput) / (1 + totalTaxasAdministrativas + seguro);
            valorFinalParcela = valorParcelaDesejada;
            if (numParcelasArray.length === 1) { 
              variacoesParcela = calcularVariacoesParcela(valorParcelaDesejada, numParcelasInput, currentTaxaAdm, rates);
            }
          }
          return {
            numParcelas: numParcelasInput,
            valorParcela: formatCurrency(valorFinalParcela),
            valorCreditoCalculado: formatCurrency(valorFinalCredito), 
            variacoesParcela: variacoesParcela
          };
        });
        
        setResultado({
          tipo: nome,
          valorCreditoOriginalDisplay: formatCurrency(valorInputFloat),
          valorCreditoOriginalRaw: valorInputFloat,
          entradaSugeridaDisplay: entradaSugeridaFloat > 0 ? formatCurrency(entradaSugeridaFloat) : null,
          entradaSugeridaRaw: entradaSugeridaFloat,
          simulacoes: resultadosIndividuais,
          codigoTaxa: getTaxaCode(activeTab, activeTab === 'taxa' ? taxaPersonalizada : SIMULATION_RATES[activeTab].taxaAdm * 100),
        });
      };

      const enviarParaTelegram = async () => {
        if (!resultado) {
          toast({ title: "Sem resultado", description: "Nenhuma simulação para enviar.", variant: "destructive" });
          return;
        }

        const empresa = currentUser === 'MULTIVENDAS' ? 'MULTINEGOCIAÇÕES LTDA' : 'JBENS SOLUÇÕES FINANCEIRAS';
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        let message = `*SIMULAÇÃO DE CONDIÇÃO DE COMPRA – ${resultado.tipo.toUpperCase()}* ${resultado.codigoTaxa}\n`;
        message += `*Data de referência:* ${formattedDate}\n\n`;
        message += `*Empresa:* ${empresa}\n`;
        message += `*Consultor:* ${currentUser}\n\n`;
        
        message += `*Valor do ${tipoCalculo === 'credito' ? SIMULATION_RATES[activeTab]?.nome.toLowerCase() : 'Crédito Estimado'}:* ${resultado.valorCreditoOriginalDisplay}\n`;
        if(resultado.entradaSugeridaDisplay) {
          message += `*Entrada sugerida:* ${resultado.entradaSugeridaDisplay}\n\n`;
        } else {
          message += `\n`;
        }
        
        message += `*Parcelas previstas:*\n`;
        resultado.simulacoes.forEach(sim => {
          message += `• ${sim.numParcelas}× de ${sim.valorParcela}\n`;
        });

        if (tipoCalculo === 'parcela' && resultado.simulacoes[0]?.variacoesParcela && resultado.simulacoes[0].variacoesParcela.length > 0) {
          message += `\n*OUTRAS OPÇÕES DE PARCELA (BASEADO NO VALOR DE PARCELA INFORMADO DE ${valorCreditoOuParcela}):*\n`;
          resultado.simulacoes[0].variacoesParcela.forEach(variacao => {
            message += `*${variacao.label}:*\n`;
            message += `  Crédito Estimado: ${variacao.valorCredito}\n`;
            message += `  Parcela: ${variacao.valorParcela} em ${variacao.numParcelas}x\n`;
            message += `-----------------------------------\n`;
          });
        }
        
        message += `\n*Observações Importantes:*\n`;
        message += `• Esta simulação possui caráter informativo e está sujeita à análise de crédito individual.\n`;
        message += `• Os valores apresentados podem sofrer variações conforme perfil, score, renda e instituição financeira.\n`;
        message += `• A aprovação dos recursos depende do envio completo da documentação exigida.\n`;
        message += `• Simulação válida por 3 dias corridos a partir da data de emissão ou até atualização de condições pelas instituições financeiras.\n`;
        message += `• Atuamos com diversas instituições financeiras e modalidades de parcelamento disponíveis no mercado com planos especiais para clientes com restrição de crédito e para profissionais autônomos.\n`;
        message += `-----------------------------------\n`;
        message += `_Simulação gerada em: ${new Date().toLocaleString('pt-BR')}_`;


        try {
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'Markdown'
            })
          });
          const data = await response.json();
          if (data.ok) {
            toast({ title: "Enviado!", description: "Simulação enviada para o Telegram com sucesso!", className: "bg-blue-500 text-white" });
          } else {
            throw new Error(data.description);
          }
        } catch (error) {
          console.error("Erro ao enviar para Telegram:", error);
          toast({ title: "Erro Telegram", description: `Falha ao enviar: ${error.message}`, variant: "destructive" });
        }
      };

      const getIconForTab = (tabKey) => {
        switch(tabKey) {
          case 'auto': return <Car className="mr-2 h-5 w-5" />;
          case 'imovel': return <Home className="mr-2 h-5 w-5" />;
          case 'pesados': return <Truck className="mr-2 h-5 w-5" />;
          case 'taxa': return <Percent className="mr-2 h-5 w-5" />;
          default: return null;
        }
      };

      return (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(newTab) => { setActiveTab(newTab); resetSimulation();}} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-slate-700 p-1 rounded-md">
              {Object.keys(PARCELAS_OPTIONS).map(tabKey => (
                <TabsTrigger 
                  key={tabKey} 
                  value={tabKey} 
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:bg-slate-600 data-[state=inactive]:text-slate-300 hover:bg-indigo-500/50 transition-all px-3 py-2.5 text-sm font-medium rounded-sm flex items-center justify-center"
                >
                  {getIconForTab(tabKey)} {SIMULATION_RATES[tabKey]?.nome || tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(PARCELAS_OPTIONS).map(tabKey => (
              <TabsContent key={tabKey} value={tabKey} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                      <Label htmlFor={`valor-${tabKey}`} className="text-slate-300 mb-1 block">
                          {tipoCalculo === 'credito' ? 'Valor do Crédito' : 'Valor Base da Parcela'}
                      </Label>
                      <Input
                          id={`valor-${tabKey}`}
                          ref={valorCreditoOuParcelaRef}
                          defaultValue={valorCreditoOuParcela}
                          onChange={(e) => handleInputChangeWithMask(e.target.value, setValorCreditoOuParcela)}
                          onFocus={(e) => applyMask(e.target)}
                          onBlur={(e) => {
                            setValorCreditoOuParcela(e.target.value); 
                          }}
                          placeholder={tipoCalculo === 'credito' ? 'Ex: 50.000,00' : 'Ex: 800,00'}
                          className="bg-slate-700 border-slate-600 placeholder-slate-500"
                      />
                  </div>
                  <div>
                    <Label htmlFor={`entrada-sugerida-${tabKey}`} className="text-slate-300 mb-1 block">
                        Entrada Sugerida (Opcional)
                    </Label>
                    <Input
                        id={`entrada-sugerida-${tabKey}`}
                        ref={entradaSugeridaRef}
                        defaultValue={entradaSugerida}
                        onChange={(e) => handleInputChangeWithMask(e.target.value, setEntradaSugerida)}
                        onFocus={(e) => applyMask(e.target)}
                        onBlur={(e) => {
                          setEntradaSugerida(e.target.value);
                        }}
                        placeholder="Ex: 9.000,00"
                        className="bg-slate-700 border-slate-600 placeholder-slate-500"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1 mt-4">
                    <Label className="text-slate-300">Opções de Parcelas</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`usar-manual-${tabKey}`}
                        checked={usarParcelasManuais}
                        onChange={(e) => {
                          setUsarParcelasManuais(e.target.checked);
                          setParcelasSelecionadas(''); 
                          if (!e.target.checked) setParcelasManuais(['']);
                        }}
                        className="form-checkbox h-4 w-4 text-indigo-500 bg-slate-600 border-slate-500 rounded focus:ring-indigo-400"
                      />
                      <Label htmlFor={`usar-manual-${tabKey}`} className="text-xs text-slate-400">Manual (até 5)</Label>
                    </div>
                  </div>
                  {usarParcelasManuais ? (
                    <div className="space-y-2">
                      {parcelasManuais.map((parcela, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={parcela}
                            onChange={(e) => handleParcelasManuaisChange(index, e.target.value)}
                            placeholder={`Parcela ${index + 1} (ex: 48)`}
                            className="bg-slate-700 border-slate-600 placeholder-slate-500 flex-grow"
                          />
                          {parcelasManuais.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeParcelaManualInput(index)} className="text-red-500 hover:text-red-400">
                              <XCircle size={20} />
                            </Button>
                          )}
                        </div>
                      ))}
                      {parcelasManuais.length < 5 && (
                        <Button variant="outline" size="sm" onClick={addParcelaManualInput} className="text-indigo-400 border-indigo-500 hover:bg-indigo-500/10 w-full">
                          <PlusCircle size={16} className="mr-2"/> Adicionar Opção de Parcela
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Select onValueChange={setParcelasSelecionadas} value={parcelasSelecionadas} disabled={usarParcelasManuais}>
                        <SelectTrigger id={`parcelas-${tabKey}`} className="w-full bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Selecione uma opção de parcelas" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 text-white border-slate-600">
                            {PARCELAS_OPTIONS[tabKey].map(p => (
                                <SelectItem key={p} value={p.toString()} className="hover:bg-slate-600 focus:bg-slate-600">
                                    {p}x
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  )}
                </div>


                {tabKey === 'taxa' && (
                  <div className="mt-4">
                    <Label htmlFor="taxa-personalizada" className="text-slate-300 mb-1 block">Taxa de Juros Personalizada (%)</Label>
                    <Input
                      id="taxa-personalizada"
                      type="number"
                      value={taxaPersonalizada}
                      onChange={(e) => setTaxaPersonalizada(e.target.value)}
                      placeholder="Ex: 25"
                      className="bg-slate-700 border-slate-600 placeholder-slate-500"
                    />
                    <p className="text-xs text-slate-400 mt-1 flex items-center">
                      <Info size={14} className="mr-1 text-indigo-400"/>
                      Insira apenas o número da porcentagem (ex: 25 para 25%).
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 mt-4">
                  <input 
                    type="checkbox" 
                    id={`tipo-calculo-${tabKey}`} 
                    checked={tipoCalculo === 'parcela'}
                    onChange={(e) => {
                      setTipoCalculo(e.target.checked ? 'parcela' : 'credito');
                      resetSimulation();
                    }}
                    className="form-checkbox h-4 w-4 text-indigo-500 bg-slate-600 border-slate-500 rounded focus:ring-indigo-400"
                  />
                  <Label htmlFor={`tipo-calculo-${tabKey}`} className="text-sm text-slate-400">Calcular por valor da parcela</Label>
                </div>
                <Button onClick={calcularSimulacao} className="w-full bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white font-semibold py-3 transition-all duration-300 flex items-center justify-center">
                  <Calculator className="mr-2 h-5 w-5" /> Calcular
                </Button>
              </TabsContent>
            ))}
          </Tabs>

          {resultado && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-slate-700 rounded-lg shadow-md border border-slate-600"
            >
              <h3 className="text-xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                Resultado da Simulação {resultado.codigoTaxa}
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong className="text-slate-300">Tipo:</strong> {resultado.tipo}</p>
                <p><strong className="text-slate-300">{tipoCalculo === 'credito' ? 'Valor do Crédito:' : 'Valor Base da Parcela Informado:'}</strong> {resultado.valorCreditoOriginalDisplay}</p>
                {resultado.entradaSugeridaDisplay && <p><strong className="text-slate-300">Entrada Sugerida:</strong> {resultado.entradaSugeridaDisplay}</p>}
                
                <hr className="my-3 border-slate-600"/>
                <h4 className="text-md font-semibold text-green-400">Opções de Parcelamento:</h4>
                {resultado.simulacoes.map((sim, index) => (
                  <div key={index} className="pl-2">
                    <p>
                      <strong className="text-slate-300">{sim.numParcelas}x</strong> de <strong className="text-green-400">{sim.valorParcela}</strong>
                      {tipoCalculo === 'parcela' && ` (Crédito Estimado: ${sim.valorCreditoCalculado})`}
                    </p>
                  </div>
                ))}

                {tipoCalculo === 'parcela' && resultado.simulacoes[0]?.variacoesParcela && resultado.simulacoes[0].variacoesParcela.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-sky-400">Outras Opções (Baseado na Parcela Informada):</h4>
                    {resultado.simulacoes[0].variacoesParcela.map((variacao, index) => (
                      <div key={index} className="pl-2 mb-1 p-2 bg-slate-650 rounded-md border border-slate-550">
                         <p className="font-semibold text-sky-400">{variacao.label}:</p>
                         <p><strong className="text-slate-300">Crédito Estimado:</strong> {variacao.valorCredito}</p>
                         <p><strong className="text-slate-300">Parcela:</strong> {variacao.valorParcela} em {variacao.numParcelas}x</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={enviarParaTelegram} className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 transition-all duration-300 flex items-center justify-center">
                 <Send className="mr-2 h-5 w-5" /> Enviar para Telegram
              </Button>
            </motion.div>
          )}
        </div>
      );
    };

    export default SimulationForm;