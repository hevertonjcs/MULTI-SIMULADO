import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';
import { PARCELAS_OPTIONS } from '@/config/constants';

const InstallmentOptions = React.memo(({
  tabKey,
  usarParcelasManuais,
  setUsarParcelasManuais,
  parcelasManuais,
  setParcelasManuais,
  parcelasSelecionadas,
  setParcelasSelecionadas,
  parcelasOptions,
}) => {

  const handleParcelasManuaisChange = useCallback((index, value) => {
    const newParcelasManuais = [...parcelasManuais];
    const sanitizedValue = value.replace(/\D/g, ''); 
    newParcelasManuais[index] = sanitizedValue;
    setParcelasManuais(newParcelasManuais);
  }, [parcelasManuais, setParcelasManuais]);

  const addParcelaManualInput = useCallback(() => {
    if (parcelasManuais.length < 5) {
      setParcelasManuais([...parcelasManuais, '']);
    }
  }, [parcelasManuais, setParcelasManuais]);

  const removeParcelaManualInput = useCallback((index) => {
    if (parcelasManuais.length > 1) {
      const newParcelasManuais = parcelasManuais.filter((_, i) => i !== index);
      setParcelasManuais(newParcelasManuais);
    } else { 
      setParcelasManuais(['']);
    }
  }, [parcelasManuais, setParcelasManuais]);

  const handleCheckboxChange = useCallback((e) => {
    setUsarParcelasManuais(e.target.checked);
    setParcelasSelecionadas(''); 
    if (!e.target.checked) setParcelasManuais(['']);
  }, [setUsarParcelasManuais, setParcelasSelecionadas, setParcelasManuais]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1 mt-4">
        <Label className="text-app-text font-medium">Opções de Parcelas</Label>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`usar-manual-${tabKey}`}
            checked={usarParcelasManuais}
            onChange={handleCheckboxChange}
            className="form-checkbox h-4 w-4 text-app-primary focus:ring-app-primary-dark rounded"
            aria-label="Usar parcelas manuais"
          />
          <Label htmlFor={`usar-manual-${tabKey}`} className="text-xs text-app-muted-foreground cursor-pointer">Manual (até 5)</Label>
        </div>
      </div>
      {usarParcelasManuais ? (
        <div className="space-y-2">
          {parcelasManuais.map((parcela, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="number"
                inputMode="numeric"
                value={parcela}
                onChange={(e) => handleParcelasManuaisChange(index, e.target.value)}
                placeholder={`Parcela ${index + 1} (ex: 48)`}
                className="input-field flex-grow"
                min="1"
                aria-label={`Parcela manual ${index + 1}`}
              />
              {parcelasManuais.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeParcelaManualInput(index)} className="text-app-error hover:text-app-error/80 p-1" aria-label={`Remover parcela manual ${index + 1}`}>
                  <XCircle size={20} />
                </Button>
              )}
            </div>
          ))}
          {parcelasManuais.length < 5 && (
            <Button variant="outline" size="sm" onClick={addParcelaManualInput} className="text-app-primary border-app-primary hover:bg-app-primary/10 w-full rounded-lg" aria-label="Adicionar opção de parcela manual">
              <PlusCircle size={16} className="mr-2"/> Adicionar Opção de Parcela
            </Button>
          )}
        </div>
      ) : (
        <Select onValueChange={setParcelasSelecionadas} value={parcelasSelecionadas} disabled={usarParcelasManuais}>
            <SelectTrigger id={`parcelas-${tabKey}`} className="w-full select-trigger-field" aria-label="Selecionar opção de parcelas">
                <SelectValue placeholder="Selecione uma opção de parcelas" />
            </SelectTrigger>
            <SelectContent className="select-content-field">
                {(parcelasOptions[tabKey] || []).map(option => (
                    <SelectItem key={option.value} value={option.value} className="select-item-field">
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      )}
    </div>
  );
});

InstallmentOptions.displayName = 'InstallmentOptions';
export default InstallmentOptions;