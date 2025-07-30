import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Send, Copy } from 'lucide-react';

const SimulationResult = React.memo(({ resultado, onSendToTelegram, buildTelegramMessage, toast, simulationRates }) => {
  if (!resultado || !simulationRates) return null;

  const formatTaxaCode = (taxa, activeTab) => {
    if ((activeTab === 'taxa' || activeTab === 'anual') && taxa) {
      const numericTaxa = parseFloat(taxa.replace(',', '.'));
      if (isNaN(numericTaxa)) return simulationRates[`${activeTab}_cod`] ? `(${simulationRates[`${activeTab}_cod`]})` : '';
      return `(Cod${String(numericTaxa).padStart(3, '0')})`;
    }
    return simulationRates[`${activeTab}_cod`] ? `(${simulationRates[`${activeTab}_cod`]})` : '';
  };

  const handleCopyToClipboard = () => {
    if (!resultado) return;
    const messageToCopy = buildTelegramMessage(resultado, true); 
    if (!messageToCopy) {
       toast({ title: "Erro ao Copiar", description: "Não foi possível gerar a mensagem para cópia.", variant: "destructive" });
       return;
    }
    navigator.clipboard.writeText(messageToCopy)
      .then(() => {
        toast({ title: "Copiado!", description: "Resultado da simulação copiado para a área de transferência.", className: "bg-app-primary text-primary-foreground" });
      })
      .catch(err => {
        console.error('Erro ao copiar texto: ', err);
        toast({ title: "Erro ao Copiar", description: "Não foi possível copiar o resultado.", variant: "destructive" });
      });
  };

  const getTipoDisplay = (tipo, activeTab, taxaPersonalizada) => {
    const baseTipo = simulationRates[`${activeTab}_nome`] || tipo || "N/A";
    const codigo = formatTaxaCode(taxaPersonalizada, activeTab);
    return `${baseTipo} ${codigo}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6 bg-app-surface rounded-lg shadow-md border border-app-input-border mb-6"
    >
      <h3 className="text-xl font-semibold mb-4 text-center text-app-primary">
        Resultado da Simulação
      </h3>
      <div className="space-y-2 text-sm text-app-text">
        <p>
          <strong className="text-app-secondary">Tipo:</strong> {getTipoDisplay(resultado.tipo, resultado.activeTab, resultado.taxaPersonalizada)}
        </p>
        <p><strong className="text-app-secondary">Valor do Crédito:</strong> {resultado.valorCreditoOriginalDisplay}</p>
        {resultado.entradaSugeridaDisplay && <p><strong className="text-app-secondary">Entrada Sugerida:</strong> {resultado.entradaSugeridaDisplay}</p>}
        
        <hr className="my-3 border-app-input-border"/>
        <h4 className="text-md font-semibold text-app-primary">Opções de Parcelamento:</h4>
        {resultado.simulacoes && resultado.simulacoes.length > 0 ? (
            resultado.simulacoes.map((sim, index) => (
            <div key={index} className="pl-2">
                <p>
                <strong className="text-app-secondary">{sim.numParcelas}x</strong> de <strong className="text-app-primary">{sim.valorParcela}</strong>
                </p>
            </div>
            ))
        ) : (
            <p className="text-app-muted-foreground">Nenhuma opção de parcelamento calculada.</p>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button 
          onClick={handleCopyToClipboard} 
          variant="outline" 
          className="w-full border-app-primary text-app-primary hover:bg-app-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center"
          aria-label="Copiar Resultado da Simulação"
          disabled={!resultado}
        >
           <Copy className="mr-2 h-5 w-5" /> Copiar Resultado
        </Button>
        <Button 
          onClick={() => onSendToTelegram(resultado)} 
          className="w-full bg-app-primary hover:bg-app-primary-dark text-primary-foreground font-semibold py-3 transition-all duration-300 flex items-center justify-center"
          aria-label="Enviar Resultado da Simulação para Telegram"
          disabled={!resultado}
        >
           <Send className="mr-2 h-5 w-5" /> Enviar para Telegram
        </Button>
      </div>
    </motion.div>
  );
});

SimulationResult.displayName = 'SimulationResult';
export default SimulationResult;