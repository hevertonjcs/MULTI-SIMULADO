import React, { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const SimulationInputs = React.memo(({
  valorCredito,
  handleValorChange,
  entradaSugerida,
  handleEntradaChange,
  valorCreditoRef,
  entradaSugeridaRef,
}) => {
  const [entradaError, setEntradaError] = useState('');

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
      maximumFractionDigits: 2,
    }).format(numericValue);

    handlerFunction(formattedValue);
    setEntradaError(''); // limpa aviso ao digitar de novo
  }, []);

  const handleFocus = useCallback((e) => {
    const value = e.target.value.replace(/[^\d,]/g, '');
    e.target.value = value;
  }, []);

  // 👉 Valida mínimo no blur
  const handleEntradaBlur = useCallback(() => {
    if (!entradaSugerida) return;

    const numericValue = parseFloat(
      entradaSugerida.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
    );

    if (isNaN(numericValue)) return;

    if (numericValue < 2898.12) {
      handleEntradaChange('R$ 2.898,12');
      setEntradaError('⚠️ A entrada mínima é R$ 2.898,12');
    }
  }, [entradaSugerida, handleEntradaChange]);

  // 👉 Função para calcular a entrada mínima (8.466% OU 2.898,12, o que for maior)
  const handleEntradaMinima = useCallback(() => {
    if (!valorCredito) return;

    const numericValue = parseFloat(
      valorCredito.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
    );

    if (isNaN(numericValue) || numericValue <= 0) return;

    let entradaMinima = numericValue * 0.08466;

    if (entradaMinima < 2898.12) {
      entradaMinima = 2898.12;
    }

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(entradaMinima);

    handleEntradaChange(formattedValue);
    setEntradaError('');
  }, [valorCredito, handleEntradaChange]);

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
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              id="entrada-sugerida"
              ref={entradaSugeridaRef}
              value={entradaSugerida}
              onChange={(e) => handleChange(e, handleEntradaChange)}
              onFocus={handleFocus}
              onBlur={handleEntradaBlur}
              placeholder="R$ 9.000,00"
              className="input-field"
              inputMode="decimal"
              aria-label="Entrada Sugerida"
            />
            <Button
              type="button"
              onClick={handleEntradaMinima}
              variant="primary"
              className="inline-flex border border-app-primary text-app-primary hover:bg-app-primary hover:text-primary-foreground transition-all duration-300 items-center justify-center px-4 py-2 rounded"
            >
              Entrada Mínima
            </Button>
          </div>
          {entradaError && (
            <span className="text-red-500 text-sm">{entradaError}</span>
          )}
        </div>
      </div>
    </div>
  );
});

SimulationInputs.displayName = 'SimulationInputs';
export default SimulationInputs;
