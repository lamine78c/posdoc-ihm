export const MENU_TIMELINE_OCC_APP_DETAIL: MenuTimeLineOccAppInterface = {
  value: 'Details',
  label: "Plus d'info",
  action: 'openPopupDetails',
  param: {},
};
export const MENU_TIMELINE_OCC_APP_STP_OCC: MenuTimeLineOccAppInterface = {
  value: 'StepOccurrences',
  label: "Gestion des occurrences d'étapes",
  action: 'openPopupStepOccurrences',
  param: {},
};
export const MENU_TIMELINE_OCC_APP_APP_OCC: MenuTimeLineOccAppInterface = {
  value: 'ApplicationOccurrences',
  label: "Gestion des occurrences d'application",
  action: 'openPopupApplicationOccurrences',
  param: {},
};
export const MENU_TIMELINE_OCC_APP_STP_VIDEO: MenuTimeLineOccAppInterface = {
  value: 'StepsVideo',
  label: 'Vidéo des étapes',
  action: 'openStepsVideo',
  param: {
    path: '/supervision/production',
    fragment: "occurrences d'étapes",
  },
};
export const MENU_TIMELINE_OCC_APP_RET_PRT: MenuTimeLineOccAppInterface = {
  value: 'ReeditByProduct',
  label: 'Réédition par produit',
  action: 'openReeditByProduct',
  param: {
    path: '/exploitation-editique/reedition',
    fragment: 'réédition par produit',
  },
};
export const MENU_TIMELINE_OCC_APP_RET_RES: MenuTimeLineOccAppInterface = {
  value: 'ReeditByResource',
  label: 'Réédition par ressource',
  action: 'openReeditByResource',
  param: {
    path: '/exploitation-editique/reedition',
    fragment: 'réédition par ressource',
  },
};
export const MENU_TIMELINE_OCC_APP_BILL: MenuTimeLineOccAppInterface = {
  value: 'Billing',
  label: 'Facturation',
  action: 'openBilling',
  param: {
    path: '/exploitation-editique/consolidation-facturation',
  },
};

export interface MenuTimeLineOccAppInterface {
  value: string;
  label: string;
  action: string;
  param: {};
}
