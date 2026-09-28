export interface AllOrganismesResult {
  code: string;
  codeRegion: string;
}

export interface AllOrganismesResultInterface {
  allOrganismes: AllOrganismesResult[];
}

export interface SearchPliByQuery {
  dtdeb?: string;
  dtfin?: string;
  numpli?: string;
  idtpli?: string;
  adress?: string;
  isCnav: boolean;
}

export interface SearchPliByQueryResult {
  status: string;
  genpro: string;
  comfic: string;
  codgam: string;
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  numpli: string;
  idtpli: string;
  adres1: string;
  adres2: string;
  adres3: string;
  adres4: string;
  adres5: string;
  adres6: string;
  adres7: string;
  datdep: string;
  mpsidd: string;
}

export interface SearchPliByQueryResultInterface {
  searchPliByQuery: SearchPliByQueryResult[];
}

export interface SearchPliByNumpliResult {
  numpli: string;
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
  plista: string;
  pliinf: string;
  zoncli: string;
  dplidc: string;
  dplidd: string;
  dplidt: string;
  dplide: string;
  dplidh: string;
  nbpage: string;
  nbfeui: string;
  edtype: string;
  poipli: string;
  coupli: string;
  idtpli: string;
  codpos: string;
  codpay: string;
  adres1: string;
  adres2: string;
  adres3: string;
  adres4: string;
  adres5: string;
  adres6: string;
  adres7: string;
  fulladress: string;
  expad1: string;
  expad2: string;
  expad3: string;
  expad4: string;
  genpro: string;
  infcl1: string;
  infcl2: string;
  datdep: string;
  mpsidd: string;
  status: string;
  cominf: string;
  codgam: string;
  prosta: string;
  proinf: string;
  prefec: boolean;
  dprodc: string;
  dprodd: string;
  dprodt: string;
  dprods: string;
  dprodh: string;
  pagfic: string;
  plific: string;
  rejfic: string;
}

export interface SearchPliByNumpliResultInterface {
  searchPliByNumpli: SearchPliByNumpliResult;
}

export interface FullAdresseSuiviAuPli {
  adres1: string;
  adres2: string;
  adres3: string;
  adres4: string;
  adres5: string;
  adres6: string;
  adres7: string;
}

export interface TransferCompteToSearch {
  compte: string;
  isCompteCnav: boolean;
}

export function isTransferCompteToSearch(obj): obj is TransferCompteToSearch {
  return obj && (obj as TransferCompteToSearch).compte !== undefined && (obj as TransferCompteToSearch).isCompteCnav !== undefined;
}
