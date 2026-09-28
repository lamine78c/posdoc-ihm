export interface DinstinctEnvOrgAppGenetpInterface {
  findDistinctCodenvCodorgCodapp: findDistinctCodenvCodorgCodapp[];
  allOrganismes: AllOrganismes[];
  allVerrous: AllVerrous[];
  allStatuts: allStatuts[];
}

export interface findDistinctCodenvCodorgCodapp {
  codenv: string;
  codorg: string;
  codapp: string;
}

export interface AllOrganismes {
  code: string;
  libelle: string;
  codeRegion: string;
  codeSite: string;
}

export interface AllVerrous {
  code: string;
}

export interface allStatuts {
  code: string;
  libelle: string;
}
