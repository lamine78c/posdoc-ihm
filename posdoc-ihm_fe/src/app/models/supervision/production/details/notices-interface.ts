export interface NoticesInterface {
  codcom: string;
  codfic: string;
  numcom: string;
  codprd: string;
  refimp: string;
  libfic: string;
  codnot: string;
  poinot: string;
  fornot: string;
  pornot: string;
  libnot: string;
  codsit: string;
}

interface NoticeWithPdfFileInterface {
  codnot: string;
  libnot: string;
  fornot: string;
  poinot: string;
  pornot: string;
  dnotir: string;
  perime: string;
  codsit: string;
  isNotAuthorisedToBeDeleted: boolean;
  pdfFilePath: string;
}

export interface AllSitesCNP {
  code: string;
}

export interface DetailsNoticesInterface {
  getDetailsNotices: NoticesInterface[];
}

export interface DeleteNoticePdfInterface {
  deleteNoticePdf: NoticeWithPdfFileInterface[];
}

export interface SiteDataInterface {
  allSitesCNP: AllSitesCNP[];
}
