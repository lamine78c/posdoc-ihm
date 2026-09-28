export const APP_OCCURRENCES_STATUS_CREATED = 'C';
export const APP_OCCURRENCES_STATUS_SUSPENDED = 'S';
export const APP_OCCURRENCES_STATUS_DELETED = 'D';
export const APP_OCCURRENCES_STATUS_TERMINATED = 'T';
export const APP_OCCURRENCES_STATUS_HISTORIQUE = 'H';

export const TYPE_DATE = ['Création', 'Validation', 'Début', 'Terminaison', 'Suspension', 'Invalidation'];

export const DELMSP = ['1', '2', '3', '4', '5', '<=5', '>5'];

export const FICHIER_STATUT_OPTIONS = [
  { value: 'C', text: 'Créé' },
  { value: 'D', text: 'Débuté' },
  { value: 'T', text: 'Terminé' },
  { value: 'S', text: 'Suspendu' },
  { value: 'V', text: 'Validé' },
  { value: 'I', text: 'Invalidé' },
  { value: 'H', text: 'Historisé' },
];

export const KEY_SESSION_DATA_SEARCH = 'user.data.search';
export const KEY_USER_ORGANISMES = 'user.organismes';

export const DEFAULT_ENVIRONNEMENT = 'P';
export const DEFAULT_NUMCOM = '00';
export const DELAI_VALUE_CHANGE = 300;
export const DELAI_VALUE_CHANGE_LONG = 1000;

export const FORM_NAME_ENVIRONNEMENT = 'environnement';
export const FORM_NAME_ORGANISME = 'organisme';
export const FORM_NAME_APPLICATION = 'application';
export const FORM_NAME_COMMANDE = 'commande';
export const FORM_NAME_FICHIER = 'fichier';
export const FORM_NAME_PERIODE = 'periode';
export const FORM_NAME_SITE = 'site';
export const FORM_NAME_STATUT = 'statut';
export const FORM_NAME_DATE = 'date';
export const FORM_NAME_DOCUMENT = 'document';
export const FORM_NAME_TYPE = 'type';
export const FORM_NAME_REFIMPRIME = 'Imprime';

export const FORM_INDEX_ENVIRONNEMENT = 1;
export const FORM_INDEX_ORGANISME = 2;
export const FORM_INDEX_APPLICATION = 3;
export const FORM_INDEX_COMMANDE = 4;
export const FORM_INDEX_COMMANDE_TEXT = 41;
export const FORM_INDEX_COMMANDE_COMBOBOX = 42;
export const FORM_INDEX_FICHIER = 5;
export const FORM_INDEX_FICHIER_TEXT = 51;
export const FORM_INDEX_FICHIER_TB = 55;
export const FORM_INDEX_FICHIER_COMBOBOX = 56;
export const FORM_INDEX_PERIODE = 6;
export const FORM_INDEX_PERIODE_TB = 66;
export const FORM_INDEX_PERIODE_TEXT = 67;
export const FORM_INDEX_SITE = 7;
export const FORM_INDEX_REFIMPRIME = 8;

export const STATUT_DEBUT = 'D';
export const STATUT_TERMINE = 'T';
export const STATUT_SUSPENDU = 'S';

export const TYPE_SUPPORT_DEFAUT = 'I';

export const CODE_CLIENT_UR_GENERAL = 'UR***';

export const TOKEN_EXPIRATION_CHECK_INTERVAL = 960000; // 16 minutes
export const NOTIFICATION_REFRESH_INTERVAL = 900000; // 15 minutes
export const FRONT_TOKEN_REFRESH_CHECK_INTERVAL = 900000;
export const PRISME_STORAGE_KEY = 'showcase_prisme';
export const PRISME_USER_STORAGE_KEY = PRISME_STORAGE_KEY + '_User';
export const DEFAULT_INACTIVITY_LOGOUT_DELAY = 10800000; // 3 heures — défaut si inactivityLogoutDelay absent de la configuration, aligné sur configuration.json
export const INACTIVITY_CHECK_INTERVAL = 60000; // 1 minute
export const ACTIVITY_TRACKING_THROTTLE = 30000; // 30 secondes
export const LAST_ACTIVITY_STORAGE_KEY = 'user.lastActivity';

export const FORM_INDEX_TB = [FORM_INDEX_PERIODE_TB, FORM_INDEX_FICHIER_TB];
export const FORM_INDEX_TEXT = [FORM_INDEX_COMMANDE_TEXT, FORM_INDEX_FICHIER_TEXT, FORM_INDEX_PERIODE_TEXT, FORM_INDEX_REFIMPRIME];
export const FORM_INDEX_COMBOBOX = [FORM_INDEX_COMMANDE_COMBOBOX, FORM_INDEX_FICHIER_COMBOBOX];

export const TYPES = [
  { value: '0', label: 'Gestionnaire' },
  { value: '1', label: 'Cotisant' },
  { value: '2', label: 'Batch mono-pdf' },
  { value: '3', label: 'Batch multi-pdf' },
];

export function getFormIndex() {
  return {
    ENVIRONNEMENT: FORM_INDEX_ENVIRONNEMENT,
    ORGANISME: FORM_INDEX_ORGANISME,
    APPLICATION: FORM_INDEX_APPLICATION,
    COMMANDE: FORM_INDEX_COMMANDE,
    COMMANDE_TEXT: FORM_INDEX_COMMANDE_TEXT,
    COMMANDE_COMBOBOX: FORM_INDEX_COMMANDE_COMBOBOX,
    FICHIER: FORM_INDEX_FICHIER,
    FICHIER_TB: FORM_INDEX_FICHIER_TB,
    FICHIER_TEXT: FORM_INDEX_FICHIER_TEXT,
    FICHIER_COMBOBOX: FORM_INDEX_FICHIER_COMBOBOX,
    PERIODE: FORM_INDEX_PERIODE,
    PERIODE_TB: FORM_INDEX_PERIODE_TB,
    PERIODE_TEXT: FORM_INDEX_PERIODE_TEXT,
    SITE: FORM_INDEX_SITE,
    REFIMPRIME: FORM_INDEX_REFIMPRIME,
  };
}

export function getFormName() {
  return {
    ENVIRONNEMENT: FORM_NAME_ENVIRONNEMENT,
    ORGANISME: FORM_NAME_ORGANISME,
    APPLICATION: FORM_NAME_APPLICATION,
    COMMANDE: FORM_NAME_COMMANDE,
    FICHIER: FORM_NAME_FICHIER,
    PERIODE: FORM_NAME_PERIODE,
    SITE: FORM_NAME_SITE,
    REFIMPRIME: FORM_NAME_REFIMPRIME,
    STATUT: FORM_NAME_STATUT,
    TYPE: FORM_NAME_TYPE,
    DOCUMENT: FORM_NAME_DOCUMENT,
    DATE: FORM_NAME_DATE,
  };
}

export const PORNOT_CODE = {
  Locale: 'L',
  Régionale: 'R',
  Nationale: 'N',
};

export const PORNOT_LABEL = {
  L: 'Locale',
  R: 'Régionale',
  N: 'Nationale',
};

export const PARECH_TYPECH_LOT = 'LOT';
export const PARECH_TYPECH_PAGE = 'PAGE';
export const PARECH_TYPECH = [PARECH_TYPECH_LOT, PARECH_TYPECH_PAGE];

export const TARIF_NUMBER = '001';

export const COD_APP_SNV2 = 'SNV2';
export const COD_APP_PNR = 'PNR';
export const PREFIXE_COD_CLI_SNV2 = 'UR';

export const ZERO = 0;
export const ONE = 1;
export const TWO = 2;
export const THREE = 3;
export const FOUR = 4;
export const FIVE = 5;
export const SIX = 6;
export const SEVEN = 7;
export const EIGHT = 8;
export const NINE = 9;
export const TEN = 10;
export const ELEVEN = 11;
export const TWELVE = 12;
export const FOURTEEN = 14;
export const FIFTEEN = 15;
export const NINETEEN = 19;
export const TWENTY = 20;
export const THIRTY_TWO = 32;
export const THIRTY_EIGHT = 38;
export const THIRTY_NINE = 39;
export const FORTY = 40;
export const FIFTY = 50;
export const EIGHTY = 80;
export const NINETY_NINE = 99;
export const ONE_HUNDRED = 100;
export const ONE_HUNDRED_FIFTY = 150;
export const ONE_HUNDRED_FIFTY_ONE = 151;
export const THREE_HUNDRED = 300;
export const ONE_THOUSAND = 1000;
export const TEN_THOUSAND = 10000;
export const ONE_HUNDRED_THIRTY_THOUSAND = 130000;

export const CODE_GAMME_SUIVI = 'CH';

export const EQUAL = '=';
export const COMMA = ',';
export const TIRET = '-';
export const UNDERSCORE = '_';
export const DEFAULT_SEPARATOR = '|';

export const MINUS_ONE = -1;

export const PAPAAD_TYPEHAS_DEFAUT = 'SHA-1';
export const PAPAAD_FORMAT_DEFAUT = 'fmt/354';
