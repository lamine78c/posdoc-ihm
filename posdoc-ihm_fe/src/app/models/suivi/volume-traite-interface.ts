export interface GetEnvsOrgsSelectionFromGenETPInterface {
  getDistinctEnvsFromGenEtp: string[];
  getDistinctOrgsFromGenEtp: string[];
  allOrganismes: [{ code: string; libelle: string; codeRegion: string }];
}

export interface GetDistRessByEnvOrgsInterface {
  getGamSitResByEnvOrgs: ResGamSitInterface[];
}

export interface ResGamSitInterface {
  codres: string;
  codgam: string;
  codsit: string;
}

export interface EnvOrgsInput {
  codeEnv: string;
  codesOrg: string[];
}

export function setEnvOrgsInput(codEnv: string, codOrgs: string[]): EnvOrgsInput {
  return {
    codeEnv: codEnv,
    codesOrg: codOrgs,
  };
}
