export interface ExpeditionResultInterface {
  getExpeditions: {
    expeditionList: ExpeditionInterface[];
    message: string;
  };
  allOrganismes: AllOrganismeInterface[];
}

export interface ExpeditionInterface {
  codenv: string;
  codorg: string;
  codapp: string;
  codcom: string;
  codfic: string;
  percod: string;
  codsit: string;
  codprd: string;
  dfiexp: Date;
  refimp: string;
  numcom: string;
  pagfic: number;
  codcli: string;
  libfic: string;
  codeRegion: string;
}

export interface AllOrganismeInterface {
  code: string;
  libelle: string;
  codeRegion: string;
}
