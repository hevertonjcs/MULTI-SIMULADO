export const applyMask = (element) => {
      if (element && typeof window.$ === 'function' && typeof window.$.fn.mask === 'function') {
        const currentValue = window.$(element).val();
        window.$(element).unmask().mask('#.##0,00', { reverse: true });
        if (currentValue) {
           window.$(element).val(currentValue).trigger('input'); 
        }
      }
    };
    
    export const removeMask = (element) => {
      if (element && typeof window.$ === 'function' && typeof window.$.fn.unmask === 'function') {
        window.$(element).unmask();
      }
    };