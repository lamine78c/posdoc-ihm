export interface SearchNoticesOccurrenceApplicationQuery {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
}

export interface NoticesOccurrenceApplicationInterface {
  getNoticesOccurrenceApplication: NoticeOccurrenceApplication[];
}

export interface NoticeOccurrenceApplication {
  codnot: string;
  poinot: number;
  fornot: string;
  pornot: string;
  libnot: string;
  codsit: string;
}
