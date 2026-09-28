export interface Echantillon {
  reference: string;
  type: string;
  nombreLots: number;
  nombrePages: number;
  random: boolean;
  formule: string;
}

export interface CreateEchantillonResultInterface {
  createParametreEchantillon: Echantillon;
}

export interface UpdateEchantillonResultInterface {
  updateParametreEchantillon: Echantillon;
}
