import { supabase } from '@/lib/supabase';

export const saveSimulation = async (simulationData) => {
  try {
    if (!simulationData.user_id) {
      console.error('Error saving simulation: user_id is missing.', simulationData);
      throw new Error('ID do usuário é obrigatório para salvar a simulação.');
    }

    const newSimulationPayload = {
      user_id: simulationData.user_id, 
      type: simulationData.tipo,
      credit_value: simulationData.valorCreditoOriginal,
      installments: simulationData.simulacoes,
      user_display_name: simulationData.user_display_name,
      company: simulationData.company,
      taxa_personalizada: simulationData.taxaPersonalizada,
      active_tab: simulationData.activeTab,
      codigo_taxa: simulationData.codigoTaxa,
      entrada_sugerida: simulationData.entradaSugerida
    };

    const { data, error } = await supabase
      .from('simulations')
      .insert([newSimulationPayload])
      .select();

    if (error) {
      console.error('Error saving simulation to Supabase:', error);
      throw error;
    }
    
    return data ? data[0] : null;

  } catch (error) {
    console.error('Erro ao salvar simulação:', error);
    throw error;
  }
};

export const getSimulations = async () => {
  try {
    const { data, error } = await supabase
      .from('simulations')
      .select(`
        *,
        users (
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching simulations from Supabase:', error);
      return [];
    }
    return data;
  } catch (error) {
    console.error('Erro ao obter simulações:', error);
    return [];
  }
};

export const deleteAllSimulations = async () => {
  try {
    const { error } = await supabase
      .from('simulations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error deleting simulations:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Erro ao deletar simulações:', error);
    throw error;
  }
};

export default {
  saveSimulation,
  getSimulations,
  deleteAllSimulations
};