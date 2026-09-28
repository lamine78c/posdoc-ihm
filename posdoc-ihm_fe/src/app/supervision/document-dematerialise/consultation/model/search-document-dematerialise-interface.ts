export interface GetDocsDematerialisesInterface {
  getDocsDematerialises: DocDematerialiseInterface[];
  allOrganismes: AllOrganismesInterface[];
}

export interface DocDematerialiseInterface {
  datdem: string;
  numdem: string;
  codenv: string;
  codorg: string;
  percod: string;
  codapp: string;
  codcom: string;
  codfic: string;
  coddoc: string;
  refdem: string;
  typact: string;
  imprim: boolean;
  docsta: string;
  docinf: string;
  ddodeb: string;
  ddofin: string;
  ddosus: string;
  tpscom: string;
  libinf: string;
  codeSiteDematerialisation: string;
}

export interface AllOrganismesInterface {
  code: string;
  libelle?: string;
  codeRegion: string;
}

export interface GetAllOrganismesInterface {
  allOrganismes: AllOrganismesInterface[];
}

export interface SearchDocDematerialiseInterface {
  date: string;
  coddoc: string;
  typact: string;
  codorgs: string[];
  docsta: string;
  codapp: string;
  codcom: string;
}

export interface GetDistinctOrgAppComFromGendocInterface {
  getDistinctOrgAppComFromGendoc: DistinctOrgAppComFromGendoc[];
  allOrganismes: AllOrganismesInterface[];
  findComDocLibFicInFichier: DocumentsInterface[];
}

export interface DistinctOrgAppComFromGendoc {
  codorg: string;
  codapp: string;
  codcom: string;
}

export interface DocumentsInterface {
  codcom: string;
  coddoc: string;
  libfic: string;
}
