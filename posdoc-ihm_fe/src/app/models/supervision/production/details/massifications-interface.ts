export interface MassificationsInterface {
  masper: string;
  mascom: string;
  masfic: string;
  masnum: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
  libFichier: string;
  refImprime: string;
  codprd: string;
  masuti: string;
  pagFic: number;
  pliFic: number;
  codcli: string;
}

export interface DetailsMassificationsInterface {
  getDetailsMassifications: MassificationsInterface[];
}
