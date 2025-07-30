import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PARCELAS_OPTIONS, SIMULATION_RATES } from '@/config/constants';
import { Car, Home, Truck, Percent, Calendar } from 'lucide-react';

const getIconForTab = (tabKey) => {
  switch(tabKey) {
    case 'auto': return <Car className="mr-2 h-5 w-5" />;
    case 'imovel': return <Home className="mr-2 h-5 w-5" />;
    case 'pesados': return <Truck className="mr-2 h-5 w-5" />;
    case 'taxa': return <Percent className="mr-2 h-5 w-5" />;
    case 'anual': return <Calendar className="mr-2 h-5 w-5" />;
    default: return null;
  }
};

const SimulationTabs = React.memo(({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="tab-list-field grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
        {Object.keys(PARCELAS_OPTIONS).map(tabKey => (
          <TabsTrigger 
            key={tabKey} 
            value={tabKey} 
            className="tab-trigger-field"
            aria-label={`Simulação para ${SIMULATION_RATES[tabKey]?.nome || tabKey}`}
          >
            {getIconForTab(tabKey)} {SIMULATION_RATES[tabKey]?.nome || tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
});

SimulationTabs.displayName = 'SimulationTabs';
export default SimulationTabs;