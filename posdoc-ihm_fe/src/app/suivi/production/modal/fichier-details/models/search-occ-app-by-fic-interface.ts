export interface SearchOccAppByFicInput {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
}

export interface SearchOccAppByFicPayloadDTO {
  searchOccAppByFic: SearchOccAppByFicInterface;
}

export interface SearchOccAppByFicInterface {
  libfic: string;
  libfor: string;
  libsup: string;
  libmul: string;
  reffor: string;
  refimp: string;
  refsup: string;
  reftri: string;
  refech: string;
  ficatt: string;
  ficsta: string;
  maxpag: number;
  codprd: string;
  repexp: number;
  typsig: string;
  codcli: string;
  codrnd: string;
  ficinf: string;
  dappcr: string;
  dfichd: string;
  dficht: string;
  dfichs: string;
  codsit: string;
  eclate: boolean;
}
