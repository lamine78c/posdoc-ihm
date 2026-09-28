export interface SearchExpeditionQuery {
  codenv?: string;
  codorg?: string[];
  codapp?: string;
  codcom?: string;
  codfic?: string;
  codcli?: string;
  percod?: string;
  codsit?: string;
  isNotNullDfiexp?: boolean;
  dfiexpDeb?: string;
  dfiexpFin?: string;
}
