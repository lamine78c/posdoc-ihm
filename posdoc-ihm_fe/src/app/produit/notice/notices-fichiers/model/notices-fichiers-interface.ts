export interface NoticesFichiersGraphQL {
  codenv: string;
  codorg: string;
  codapp: string;
  codcom: string;
  codfic: string;
  codeProd: string;
  refImprime: string;
  notices: string[];
}

export interface NoticesFichiersInterface extends NoticesFichiersGraphQL {
  codenv_codorg_codapp: string;
  codcom_codfic: string;
  noticesString: string;
}
