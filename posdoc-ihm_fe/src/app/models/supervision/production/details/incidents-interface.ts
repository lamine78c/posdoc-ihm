export interface IncidentsInterface {
  signal: string;
  dcreat: string;
  script: string;
  mesano: string;
  ficinf: string;
  typetp: string;
  codcom: string;
  codfic: string;
  numcom: string;
  codgam: string;
  codsit: string;
  codres: string;
}

export interface DetailsIncidentsInterface {
  getDetailsIncidents: IncidentsInterface[];
}

export interface IncidentsOccEtapeInterface {
  dcreat: string;
  mesano: string;
  script: string;
}

export interface DetailsIncidentsOccEtapeInterface {
  getIncidentsByIdetap: IncidentsOccEtapeInterface[];
}
