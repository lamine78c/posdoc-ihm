export interface PeriodeInterface {
  perCod: string;
  appsta: string;
  dappld: Date;
  dapplt: Date;
  manuel: boolean;
}

export interface DetailsPeriodeInterface {
  getDetailsPeriodeFromGenApp: PeriodeInterface[];
}
