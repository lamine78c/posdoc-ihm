export interface DocumentsVideoInterface {
  codorg: string;
  codapp: string;
  percod: string;
  codenv: string;
  codcom: string;
  codfic: string;
  coddoc: string;
  refdem: string;
  typact: string;
  imprim: boolean;
  docsta: string;
  docinf: string;
  ddodeb: string;
  ddofin: string;
  ddosus: string;
  tpscom: string;
  libinf: string;
  codeSiteDematerialisation: string;
}

export interface DetailInformationDocumentsVideoInterface {
  getDocsDematerialisesVideoInfoDetail: DocumentsVideoInterface;
}
