export interface Organisme {
  code: string;
  libelle: string;
  adresse1: string;
  adresse2: string;
  adresse3: string;
  adresse4: string;
  type: string;
  codeRegion: string;
  codeSite: string;
}

export interface SearchOrgByEnvDataInterface {
  getDistOrgByEnvFromExemplaire: string[];
  allOrganismes: AllOrganismeDtoInterface[];
}

export interface AllOrganismeDtoInterface {
  code: string;
  libelle: string;
  codeRegion: string;
}

export interface Organisme {
  getCodesOrganismesByRegions: string[];
}

export interface OrganismeData {
  data: Organisme;
}
