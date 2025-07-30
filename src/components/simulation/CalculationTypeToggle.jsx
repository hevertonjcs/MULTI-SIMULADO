import React from 'react';
    import { Label } from '@/components/ui/label';

    const CalculationTypeToggle = ({ tabKey, tipoCalculo, setTipoCalculo }) => {
      return (
        <div className="flex items-center space-x-2 mt-4">
          <input 
            type="checkbox" 
            id={`tipo-calculo-${tabKey}`} 
            checked={tipoCalculo === 'parcela'}
            onChange={(e) => setTipoCalculo(e.target.checked ? 'parcela' : 'credito')}
            className="form-checkbox h-4 w-4 text-indigo-500 bg-slate-600 border-slate-500 rounded focus:ring-indigo-400"
          />
          <Label htmlFor={`tipo-calculo-${tabKey}`} className="text-sm text-slate-400">Calcular por valor da parcela</Label>
        </div>
      );
    };

    export default CalculationTypeToggle;