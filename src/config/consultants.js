export const COMPANIES = {
  MN: "Multinegociacoes LTDA",
  JB: "JBENS SOLUCOES FINANCEIRAS LTDA",
  WGA: "WGA CORPORATION LTDA"
};

export const ATTENDANT_PROFILES = {
  // Para adicionar um novo usuário, siga este formato:
  // USUARIO: { display: "Nome de Exibição", company: "MN" ou "JB" },
  
  // Supervisores
  ROYAL: { display: "Supervisor Vitor", company: "MN" },
  ELITE: { display: "Diretor Comercial H Junior", company: "MN" },
  RAULV: { display: "Supervisor Raul Vitor", company: "MN" },
  HEVERTON: { display: "Supervisor Heverton Junior", company: "MN" },
  
  // Administrativo
  SOPHIA: { display: "Administrativo Sophia", company: "MN" },
  
  // WGA Corporation
  WGA: { display: "Diretor Comercial Wellington Goehl", company: "WGA" },
  
  // Consultores MN
  PEDROH: { display: "Pedro Henrique", company: "MN" },
  MARIAEDUARDA: { display: "Consultora Maria Eduarda", company: "MN" },
  BEA: { display: "Consultora Beatriz", company: "MN" },
  BRUNO: { display: "Consultor Bruno", company: "MN" },
  YAN: { display: "Consultor Yan", company: "MN" },
  ANDERSON: { display: "Consultor Anderson", company: "MN" },
  GEOVANA: { display: "Consultora Geovana", company: "MN" },
  ALESSANDRO: { display: "Consultor Alessandro", company: "MN" },
  RAFAEL: { display: "Consultor Rafael", company: "MN" },
  JULIO: { display: "Consultor Julio", company: "MN" },
  
  // Consultores JB
  LARA: { display: "Consultora Lara", company: "JB" },
  CLARA: { display: "Consultora Clara", company: "JB" },
  NATANAEL: { display: "Consultor Natanael", company: "JB" },
  JULIANY: { display: "Diretora Comercial Juliany", company: "JB" },
};

export const getCredentials = () => {
  const credentials = {};
  for (const userKey in ATTENDANT_PROFILES) {
    const profile = ATTENDANT_PROFILES[userKey];
    // Define a senha baseada na empresa
    if (profile.company === "MN") {
      credentials[userKey] = "multivendas";  // Senha para usuários da Multinegociações
    } else if (profile.company === "JB" || profile.company === "WGA") {
      credentials[userKey] = "vendas2025";   // Senha para usuários da JBENS e WGA
    }
  }
  return credentials;
};