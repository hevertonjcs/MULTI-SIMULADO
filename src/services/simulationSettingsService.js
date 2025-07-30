import { supabase } from '@/lib/supabase';

const OUTPUT_TEMPLATE_KEY = 'output_template';
const SIMULATION_VARIABLES_KEY = 'simulation_variables';

const simulationSettingsService = {
  async getOutputTemplate() {
    const { data, error } = await supabase
      .from('simulation_settings')
      .select('value')
      .eq('setting_key', OUTPUT_TEMPLATE_KEY)
      .single();

    if (error) {
      console.error('Error fetching output template:', error);
      throw new Error('Failed to fetch output template.');
    }
    return data ? data.value : { template: "" };
  },

  async updateOutputTemplate(template) {
    const { data, error } = await supabase
      .from('simulation_settings')
      .update({ value: { template }, updated_at: new Date().toISOString() })
      .eq('setting_key', OUTPUT_TEMPLATE_KEY)
      .select();
    
    if (error) {
      console.error('Error updating output template:', error);
      throw new Error('Failed to update output template.');
    }
    return data;
  },

  async getSimulationVariables() {
    const { data, error } = await supabase
      .from('simulation_settings')
      .select('value')
      .eq('setting_key', SIMULATION_VARIABLES_KEY)
      .single();

    if (error) {
      console.error('Error fetching simulation variables:', error);
      throw new Error('Failed to fetch simulation variables.');
    }
    return data ? data.value : {};
  },

  async updateSimulationVariables(variables) {
    const { data, error } = await supabase
      .from('simulation_settings')
      .update({ value: variables, updated_at: new Date().toISOString() })
      .eq('setting_key', SIMULATION_VARIABLES_KEY)
      .select();

    if (error) {
      console.error('Error updating simulation variables:', error);
      throw new Error('Failed to update simulation variables.');
    }
    return data;
  }
};

export default simulationSettingsService;