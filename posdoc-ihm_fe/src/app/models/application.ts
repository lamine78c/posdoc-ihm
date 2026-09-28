export interface Application {
  code: string;
  libelle: string;
  codeOrganisation: string;
  codeEnvironnement: string;
  codeSystem: string;
  codeGroupe: string;
  lotNumber: string;
  typeRefection: string;
}

export interface SearchAppByEnvOrgDataInterface {
  getDistAppByEnvOrgFromExemplaire: string[];
}
