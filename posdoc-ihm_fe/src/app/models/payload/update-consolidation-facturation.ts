export interface UpdateConsolidationFacturationQuery {
  codenv: string;
  codorg: string[];
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  codsit: string;
  consolidations: UpdateConsolidationFacturation[];
}

export interface UpdateConsolidationFacturation {
  codenv: string;
  codorg: string[];
  codapp: string;
  percod: string;
  codcom: string;
  numcom: string;
  codfic: string;
  tarifs: UpdateTarifConsolidationFacturation[];
}

export interface UpdateTarifConsolidationFacturation {
  typtar: string;
  nbplis: number;
  coutot: number;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
}
