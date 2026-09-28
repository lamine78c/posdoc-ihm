export interface FacturationInterface {
  searchFacturationDetaillee: FacturationDetailleeInterface[];
}

export interface FacturationDetailleeDTOInterface {
  searchFacturationDetaillee: {
    facturationDetailleeWithAllColumns: FacturationDetailleeInterface[];
    message: string;
  }
}

export class SearchFacturationDetailleePayloadModel {
  dfiexpDeb: string;
  dfiexpFin: string;
  codorgs: string[] | null;
  codclis: string[] | null;
  typtars: string[] | null;
  codenv: string;
  codapp: string;
  codcom: string;
  codfic: string;
  codsit: string;
  showTotal: boolean;
}

export interface TarifInterface {
  codeTar: string;
  plis: number;
  cout: number;
}

export interface FacturationDetailleeInterface {
  codorg: string;
  codapp: string;
  codcom: string;
  codfic: string;
  dfiexp: string;
  codsit: string;
  codreg: string;
  codcli: string;
  totalPages: number;
  totalPlis: number;
  coutTotal: number;
  tarifs: TarifInterface[];
}

export interface DistinctEnvOrgAppSiteClientTarifInterface {
  findCodeEnv: { code: string }[];
  findCodeApp: { code: string }[];
  allOrganismes: { code: string; libelle: string; codeRegion: string; codeSite: string }[];
  findCodeOrganismesByTypeR: { code: string }[];
  allSitesCNP: { code: string }[];
  allClients: { code: string }[];
  findTyptarFromGentar: { typtar: string }[];
}

export interface FacturationDetailleeOptionsInterface {
  data: DistinctEnvOrgAppSiteClientTarifInterface[];
}
