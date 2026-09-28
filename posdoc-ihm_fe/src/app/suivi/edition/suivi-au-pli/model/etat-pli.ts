import { CODE_GAMME_SUIVI } from '@app/shared/utils/Constants';

export const badgeVideHtml = '<div class="badge badge-vide ms-1 mt-auto">&nbsp;</div>';
export const badgeVertHtml = '<div class="badge badge-success ms-1 mt-auto">&nbsp;</div>';
export const badgeRougeHtml = '<div class="badge badge-error ms-1 mt-auto">&nbsp;</div>';

export interface EtatPliIHM {
  KEY;
  ETAT;
  TEXT;
  TEXT_CLASS;
  HTML;
  HTML_SUIVI;
  ICONE;
  DATE_KEY;
}
export interface EtatPliInterface {
  STATUS_CREE: EtatPliIHM;
  STATUS_NON_DEPOSE: EtatPliIHM;
  STATUS_DEPOSE: EtatPliIHM;
  STATUS_ERREUR: EtatPliIHM;
  STATUS_DISTRIBUE: EtatPliIHM;
  STATUS_PND: EtatPliIHM;
  STATUS_ENATTENTE_DISTRIBUE: EtatPliIHM;
}

export const etatPli: EtatPliInterface = {
  STATUS_CREE: {
    KEY: 'STATUS_CREE',
    ETAT: [null],
    TEXT: 'Créé',
    TEXT_CLASS: 'text-success',
    HTML: badgeVideHtml,
    HTML_SUIVI: badgeVideHtml + badgeVideHtml,
    ICONE: 'icon-b_valid_empty icon-success',
    DATE_KEY: 'dplidc',
  },
  STATUS_NON_DEPOSE: {
    KEY: 'STATUS_NON_DEPOSE',
    ETAT: ['0', '', ' '],
    TEXT: 'En attente de dépôt',
    TEXT_CLASS: 'text-gray',
    HTML: badgeVideHtml,
    HTML_SUIVI: badgeVideHtml + badgeVideHtml,
    ICONE: 'icon-absence-objet icon-gray',
    DATE_KEY: '',
  },
  STATUS_DEPOSE: {
    KEY: 'STATUS_DEPOSE',
    ETAT: ['1', '5'],
    TEXT: 'Dépôt confirmé par la Poste',
    TEXT_CLASS: 'text-success',
    HTML: badgeVertHtml,
    HTML_SUIVI: badgeVertHtml + badgeVideHtml,
    ICONE: 'icon-b_valid_empty icon-success',
    DATE_KEY: 'datdep',
  },
  STATUS_ERREUR: {
    KEY: 'STATUS_ERREUR',
    ETAT: ['2'],
    TEXT: 'Erreur en retour de la Poste',
    TEXT_CLASS: 'text-error',
    HTML: badgeRougeHtml,
    HTML_SUIVI: badgeRougeHtml + badgeVideHtml,
    ICONE: 'icon-b_off icon-error',
    DATE_KEY: '',
  },
  STATUS_DISTRIBUE: {
    KEY: 'STATUS_DISTRIBUE',
    ETAT: ['3'],
    TEXT: 'Pli distribué avec AR',
    TEXT_CLASS: 'text-success',
    HTML: '',
    HTML_SUIVI: badgeVertHtml + badgeVertHtml,
    ICONE: 'icon-b_valid_empty icon-success',
    DATE_KEY: '',
  },
  STATUS_PND: {
    KEY: 'STATUS_PND',
    ETAT: ['4'],
    TEXT: 'Pli non distribué',
    TEXT_CLASS: 'text-error',
    HTML: '',
    HTML_SUIVI: badgeVertHtml + badgeRougeHtml,
    ICONE: 'icon-b_off icon-error',
    DATE_KEY: '',
  },
  STATUS_ENATTENTE_DISTRIBUE: {
    KEY: 'STATUS_ENATTENTE_DISTRIBUE',
    ETAT: ['IHM_1'],
    TEXT: 'En attente de distribution',
    TEXT_CLASS: 'text-gray',
    HTML: '',
    HTML_SUIVI: badgeVertHtml + badgeVideHtml,
    ICONE: 'icon-absence-objet icon-gray',
    DATE_KEY: '',
  },
};

export const etatSuiviAR = {
  STATUS_CREE: [etatPli['STATUS_CREE'], etatPli['STATUS_NON_DEPOSE'], etatPli['STATUS_ENATTENTE_DISTRIBUE']],
  STATUS_NON_DEPOSE: [etatPli['STATUS_CREE'], etatPli['STATUS_NON_DEPOSE'], etatPli['STATUS_ENATTENTE_DISTRIBUE']],
  STATUS_DEPOSE: [etatPli['STATUS_CREE'], etatPli['STATUS_DEPOSE'], etatPli['STATUS_ENATTENTE_DISTRIBUE']],
  STATUS_ERREUR: [etatPli['STATUS_CREE'], etatPli['STATUS_ERREUR'], etatPli['STATUS_ENATTENTE_DISTRIBUE']],
  STATUS_DISTRIBUE: [etatPli['STATUS_CREE'], etatPli['STATUS_DEPOSE'], etatPli['STATUS_DISTRIBUE']],
  STATUS_PND: [etatPli['STATUS_CREE'], etatPli['STATUS_DEPOSE'], etatPli['STATUS_PND']],
};

export const etatSuivi = {
  STATUS_CREE: [etatPli['STATUS_CREE'], etatPli['STATUS_NON_DEPOSE']],
  STATUS_NON_DEPOSE: [etatPli['STATUS_CREE'], etatPli['STATUS_NON_DEPOSE']],
  STATUS_DEPOSE: [etatPli['STATUS_CREE'], etatPli['STATUS_DEPOSE']],
  STATUS_ERREUR: [etatPli['STATUS_CREE'], etatPli['STATUS_ERREUR']],
  STATUS_DISTRIBUE: [],
  STATUS_PND: [],
};

export function getEtatPli(etat) {
  return Object.values(etatPli).filter(v => v.ETAT.includes(etat))[0];
}

export function getEtatPliText(etat) {
  const etatPli = getEtatPli(etat);
  if (etatPli) {
    return etatPli.TEXT;
  }
  return '';
}

export function getEtatPliHtml(etat, codGam) {
  const etatPli = getEtatPli(etat);
  if (etatPli) {
    if (isGammeSuivi(codGam)) {
      return etatPli.HTML_SUIVI;
    } else {
      return etatPli.HTML;
    }
  }
  return '';
}

export function isGammeSuivi(codGam) {
  return codGam && codGam.toUpperCase() === CODE_GAMME_SUIVI;
}

export function getSuivi(etat, codGam) {
  const etatPli = getEtatPli(etat);
  if (etatPli) {
    if (isGammeSuivi(codGam)) {
      return etatSuiviAR[etatPli['KEY']];
    } else {
      return etatSuivi[etatPli['KEY']];
    }
  }
  return null;
}
