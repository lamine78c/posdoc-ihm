export interface DetailsMassificationOccurrenceEtape {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  refimp: string;
  libfic: string;
}

export interface DetailsMassificationOccurrenceEtapeInterface {
  findDetailsMassificationForOccurrenceEtape: DetailsMassificationOccurrenceEtape[];
}
