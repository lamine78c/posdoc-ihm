export interface NotficInterface {
  codenv: string;
  codorg: string;
  codapp: string;
  codcom: string;
  codfic: string;
  codnot: string;
  dnotid: string;
  dnotit: string;
  maxnot: string;
}

export interface NotficIdInterface {
  codenv: string;
  codorg: string;
  codapp: string;
  codcom: string;
  codfic: string;
  codnot: string;
}

export interface NotficNodeDataInterface {
  codnot: string;
  codapp: string;
  codcom: string;
  codcom_codfic: string;
  codeProd: string;
  codenv: string;
  codenv_codorg_codapp: string;
  codfic: string;
  codorg: string;
  dnotid: string;
  dnotit: string;
  maxnot: string;
  refImprime: string;
  isAuthorisedToReset: boolean;
  dnotid_old: string;
  dnotit_old: string;
}

export interface NotficCreateInputInterface {
  codnot: string;
  codenv: string;
  codorg: string;
  codapp: string;
  codcom: string;
  codfic: string;
  dnotid: string;
  dnotit: string;
}

export interface AffectationNoticesInterface {
  findNotficByParam: NotficNodeDataInterface[];
}

export interface FindFichiersForAffectationNoticeInterface {
  findFichiersForAffectationNotice: NotficNodeDataInterface[];
}

export interface FindFicPrdImpByEnvOrgAppComInterface {
  findFicPrdImpByEnvOrgAppCom: FicPrdImpInterface[];
}

export interface FicPrdImpInterface {
  codfic: string;
  refimp: string;
  codprd: string;
}
