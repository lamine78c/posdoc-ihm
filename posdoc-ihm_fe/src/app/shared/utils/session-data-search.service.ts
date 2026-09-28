import { Injectable } from '@angular/core';
import {
  FORM_INDEX_APPLICATION,
  FORM_INDEX_COMMANDE,
  FORM_INDEX_ENVIRONNEMENT,
  FORM_INDEX_FICHIER,
  FORM_INDEX_ORGANISME,
  FORM_INDEX_PERIODE,
  getFormIndex,
  getFormName,
  KEY_SESSION_DATA_SEARCH,
} from './Constants';
import SharedUtil from './SharedUtil';

@Injectable({
  providedIn: 'root',
})
export class SessionDataSearchService {
  formName = getFormName();
  formIndex = getFormIndex();

  // MAJ des critères de la recherche dans la session
  setDataSearchToSession(data: DataSearchFromSession): void {
    sessionStorage.setItem(KEY_SESSION_DATA_SEARCH, JSON.stringify(data));
  }

  // Récupérer des critères de la recherche sauvegardés dans la session
  getDataSearchFromSession(): DataSearchFromSession {
    const searchDataSelected = sessionStorage.getItem(KEY_SESSION_DATA_SEARCH);
    if (!!searchDataSelected) {
      return JSON.parse(searchDataSelected);
    } else {
      return this.initDataSearchFromSession();
    }
  }

  // Récupérer des valeurs de form et sauvegarder dans la session
  updateDataSearchToSession(formRawValue: any) {
    let data = this.initDataSearchFromSession();

    if (!!formRawValue[this.formName.ENVIRONNEMENT]) {
      const envs = formRawValue[this.formName.ENVIRONNEMENT];
      if (typeof envs === 'object') {
        let selectedEnvs: string[] = Object.keys(envs).filter((k: string) => envs[k]);
        data[this.formIndex.ENVIRONNEMENT] = selectedEnvs;
      } else {
        data[this.formIndex.ENVIRONNEMENT] = [envs];
      }
    }

    if (!!formRawValue[this.formName.ORGANISME]) {
      const rawOrg = formRawValue[this.formName.ORGANISME];
      if (typeof rawOrg === 'object') {
        let selectedOrgs: string[] = [];
        SharedUtil.extractSelectedOrgs(rawOrg, selectedOrgs);
        data[this.formIndex.ORGANISME] = selectedOrgs;
      } else {
        data[this.formIndex.ORGANISME] = [rawOrg];
      }
    }

    if (!!formRawValue[this.formName.APPLICATION]) {
      data[this.formIndex.APPLICATION] = formRawValue[this.formName.APPLICATION];
    }

    if (!!formRawValue[this.formName.COMMANDE]) {
      data[this.formIndex.COMMANDE] = formRawValue[this.formName.COMMANDE];
    }

    if (!!formRawValue[this.formName.FICHIER]) {
      data[this.formIndex.FICHIER] = formRawValue[this.formName.FICHIER];
    }

    if (!!formRawValue[this.formName.PERIODE]) {
      data[this.formIndex.PERIODE] = formRawValue[this.formName.PERIODE];
    }

    if (!!formRawValue[this.formName.REFIMPRIME]) {
      data[this.formIndex.REFIMPRIME] = formRawValue[this.formName.REFIMPRIME];
    }

    this.setDataSearchToSession(data);
  }

  initDataSearchFromSession(): DataSearchFromSession {
    return {
      [FORM_INDEX_ENVIRONNEMENT]: [],
      [FORM_INDEX_ORGANISME]: [],
      [FORM_INDEX_APPLICATION]: null,
      [FORM_INDEX_COMMANDE]: null,
      [FORM_INDEX_FICHIER]: null,
      [FORM_INDEX_PERIODE]: null,
    };
  }

  getDataSessionByIndexForm(index: number, dataSession) {
    const indexForm = getFormIndex();

    const indexMapping = {
      [indexForm.PERIODE_TB]: indexForm.PERIODE,
      [indexForm.PERIODE_TEXT]: indexForm.PERIODE,
      [indexForm.FICHIER_TB]: indexForm.FICHIER,
      [indexForm.COMMANDE_TEXT]: indexForm.COMMANDE,
      [indexForm.FICHIER_TEXT]: indexForm.FICHIER,
      [indexForm.COMMANDE_COMBOBOX]: indexForm.COMMANDE,
      [indexForm.FICHIER_COMBOBOX]: indexForm.FICHIER,
    };

    const resolvedIndex = indexMapping[index] ?? index;

    return dataSession[resolvedIndex];
  }
}

export interface DataSearchFromSession {
  [FORM_INDEX_ENVIRONNEMENT]: string[];
  [FORM_INDEX_ORGANISME]: string[];
  [FORM_INDEX_APPLICATION]: string;
  [FORM_INDEX_COMMANDE]: string;
  [FORM_INDEX_FICHIER]: string;
  [FORM_INDEX_PERIODE]: string;
}
