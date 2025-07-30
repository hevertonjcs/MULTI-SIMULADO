import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SimulationInputs = React.memo(({
  valorCredito,
  handleValorChange,
  entradaSugerida,
  handleEntradaChange,
  valorCreditoRef,
  entradaSugeridaRef,
}) => {
  
  const handleChange = useCallback((e, handlerFunction) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value === '') {
      handlerFunction('');
      return;
    }
    
    const numericValue = parseFloat(value) / 100;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
    
    handlerFunction(formattedValue);
  }, []);

  const handleFocus = useCallback((e) => {
    const value = e.target.value.replace(/[^\d,]/g, '');
    e.target.value = value;
  }, []);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
      <div>
        <Label htmlFor="valor-credito" className="text-app-text font-medium mb-1 block">
          Valor do Crédito
        </Label>
        <Input
          id="valor-credito"
          ref={valorCreditoRef}
          value={valorCredito}
          onChange={(e) => handleChange(e, handleValorChange)}
          onFocus={handleFocus}
          placeholder="R$ 50.000,00"
          className="input-field"
          inputMode="decimal"
          aria-label="Valor do Crédito"
        />
      </div>
      <div>
        <Label htmlFor="entrada-sugerida" className="text-app-text font-medium mb-1 block">
          Entrada Sugerida (Opcional)
        </Label>
        <Input
          id="entrada-sugerida"
          ref={entradaSugeridaRef}
          value={entradaSugerida}
          onChange={(e) => handleChange(e, handleEntradaChange)}
          onFocus={handleFocus}
          placeholder="R$ 9.000,00"
          className="input-field"
          inputMode="decimal"
          aria-label="Entrada Sugerida"
        />
      </div>
    </div>
  );
});

SimulationInputs.displayName = 'SimulationInputs';
export default SimulationInputs;