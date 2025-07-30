export const BOT_TOKEN = "7670409313:AAHBqyt9CtMvVnwlfGmu6pYPPcqosBtQxgY";
export const CHAT_ID = "-1002384569498";

const generateParcelasOptions = (optionsArray) => {
  return optionsArray.map(parcelas => {
    const label = parcelas.join('x, ') + 'x';
    const value = parcelas.join('x ') + 'x';
    return { label, value };
  });
};

const generateAnualOptions = (optionsArray) => {
  return optionsArray.map(anos => {
    const label = anos.join(' anos, ') + ' anos';
    const value = anos.map(ano => (ano * 12).toString()).join('x ') + 'x';
    return { label, value };
  });
};

export const PARCELAS_OPTIONS = {
  auto: generateParcelasOptions([
    [12, 24, 36],
    [24, 36, 48],
    [36, 48, 60],
    [48, 60, 80],
    [60, 80, 110],
    [80, 110, 130],
    [130, 180, 210],
    [210, 280, 320],
  ]),
  imovel: generateParcelasOptions([
    [12, 24, 36],
    [24, 36, 48],
    [36, 48, 60],
    [48, 60, 80],
    [60, 80, 110],
    [80, 110, 130],
    [130, 180, 210],
    [210, 280, 320],
  ]),
  pesados: generateParcelasOptions([
    [12, 24, 36],
    [24, 36, 48],
    [36, 48, 60],
    [48, 60, 80],
    [60, 80, 110],
    [80, 110, 130],
    [130, 180, 210],
    [210, 280, 320],
  ]),
  taxa: generateParcelasOptions([
    [12, 24, 36],
    [24, 48, 60],
    [48, 60, 92],
    [92, 120, 160],
  ]),
  anual: generateAnualOptions([
    [2, 4, 6],
    [3, 4, 6],
    [4, 6, 8],
    [8, 10, 12],
    [10, 12, 15],
    [12, 15, 18],
  ]),
};

export const SIMULATION_RATES = {
  auto: { nome: "Automóvel", taxaAdm: 0.30, fundoReserva: 0.00, seguro: 0.00, cod: "030" },
  imovel: { nome: "Imóvel", taxaAdm: 0.31, fundoReserva: 0.00, seguro: 0.00, cod: "031" },
  pesados: { nome: "Pesados", taxaAdm: 0.32, fundoReserva: 0.00, seguro: 0.00, cod: "032" },
  taxa: { nome: "Especial", taxaAdm: null, fundoReserva: 0.00, seguro: 0.00, cod: null },
  anual: { nome: "Anual", taxaAdm: null, fundoReserva: 0.00, seguro: 0.00, cod: null, isAnual: true },
};