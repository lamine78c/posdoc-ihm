export interface DocDemOccurrenceApplicationInterface {
  getDocDemOccurrenceApplication: DocDemOccurrenceApplication[];
}

export interface DocDemOccurrenceApplication {
  datdem: string;
  numdem: number;
  coddoc: string;
  refdem: string;
  typact: string;
  ddodeb: string;
  ddofin: string;
}
