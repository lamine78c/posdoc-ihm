export interface OccurrenceFichier {
  codenv: string;
  codorg: string;
  codapp: string;
  percod: string;
  codcom: string;
  codfic: string;
  numcom: string;
  codprd: string;
  ficsta: string;
  ficinf: string;
  frefec: boolean;
  ficvid: boolean;
  dappcr: Date;
  dfichd: Date;
  dficht: Date;
  application?: string;
  periode?: string;
  fichier?: string;
  statut?: string;
  refection?: boolean;
  dateAppli?: Date;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface OccurrencesFichiersFilters {
  codenv: string;
  codorg?: string[] | null;
  codapp?: string | null;
  percod?: string | null;
  codcom?: string | null;
  codfic?: string | null;
  codprd?: string | null;
  codsta?: string | null;
  refimp?: string | null;
}
