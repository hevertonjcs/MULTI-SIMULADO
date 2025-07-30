import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

const CustomRateInput = React.memo(({ taxaPersonalizada, setTaxaPersonalizada }) => {
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9.,]/g, '');
    setTaxaPersonalizada(sanitizedValue);
  }, [setTaxaPersonalizada]);

  return (
    <div className="mt-4">
      <Label htmlFor="taxa-personalizada" className="text-app-text font-medium mb-1 block">Taxa de Juros Personalizada (%)</Label>
      <Input
        id="taxa-personalizada"
        type="text" 
        inputMode="decimal"
        value={taxaPersonalizada}
        onChange={handleChange}
        placeholder="Ex: 2.5 ou 25"
        className="input-field"
        aria-label="Taxa de Juros Personalizada"
      />
      <p className="text-xs text-app-muted-foreground mt-1 flex items-center">
        <Info size={14} className="mr-1 text-app-primary"/>
        Insira a taxa. Ex: 2.5 para 2.5% ou 25 para 25%.
      </p>
    </div>
  );
});

CustomRateInput.displayName = 'CustomRateInput';
export default CustomRateInput;