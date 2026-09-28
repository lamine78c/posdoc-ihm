import { FormControl, FormGroup } from '@angular/forms';
import { AllOrgRegionInterface } from '@app/models/exploitation-editique/massification/all-organisme-interface';

export class FormUtil {
  /**
   * Fonction pour la création du formulaire pour la liste déroulante hiérarchique.
   * @param orgForm le formulaire à créer, si il y a déjà des éléments dedans, ils seront supprimés.
   * @param orgData la liste des organismes à ajouter au formulaire, sous forme
   * d'un array de code organisme, ex: ['315', '750', '904']
   * @param allOrgRegData la liste de tous les organismes avec leur région sous forme d'un tableau d'objets
   * c'est cette liste qui va nous permettre de trouver chaque région de la liste 'orgData'
   * @param isFilterActive indique si le filtre est actif
   * @param listOfOldSelectedOrganismes liste des organismes précédemment sélectionnés
   * @param useCodeSite indique s'il faut utiliser le code du site au lieu du code de l'organisme
   */
  static getOrgFormByOrgData(
    orgForm: FormGroup,
    orgData: Array<string>,
    allOrgRegData: [AllOrgRegionInterface],
    isFilterActive: boolean,
    listOfOldSelectedOrganismes: string[] = [],
    useCodeSite = false
  ) {
    const allOrgReg = FormUtil.normalizeRegionData(allOrgRegData);

    const orgRegGrouped = FormUtil.createRegionGroupedStructure(orgData, allOrgReg, useCodeSite);

    FormUtil.clearFormControls(orgForm);

    FormUtil.buildHierarchicalForm(orgForm, orgRegGrouped, isFilterActive, listOfOldSelectedOrganismes);

    FormUtil.sortFormGroupControls(orgForm);
    orgForm.updateValueAndValidity({ emitEvent: true });

    return orgForm;
  }

  /**
   * Normalise les données de région en remplaçant les chaînes vides par null
   */
  private static normalizeRegionData(allOrgRegData: [AllOrgRegionInterface]) {
    return allOrgRegData.map(e => {
      if (e.codeRegion === '') {
        e.codeRegion = null;
      }
      return e;
    });
  }

  /**
   * Crée une structure d'organismes regroupés par région
   */
  private static createRegionGroupedStructure(orgData: Array<string>, allOrgReg: any[], useCodeSite: boolean) {
    const orgReg = this.mapOrganismesToRegions(orgData, allOrgReg, useCodeSite);

    return this.groupOrganismesByRegion(orgReg);
  }

  /**
   * Associe chaque organisme à sa région
   */
  private static mapOrganismesToRegions(orgData: Array<string>, allOrgReg: any[], useCodeSite: boolean) {
    return orgData
      .filter(o => !!allOrgReg.find(i => i.code == o))
      .map(e => {
        const cr = allOrgReg.find(i => i.code == e)?.codeRegion;
        const codeOrg = useCodeSite ? allOrgReg.find(i => i.code === e)?.codeSite : e;
        return { organisme: codeOrg, region: cr };
      });
  }

  /**
   * Regroupe les organismes par région
   */
  private static groupOrganismesByRegion(orgReg: { organisme: any; region: any }[]) {
    return orgReg.reduce((result: any, currentValue: any) => {
      if (!result[currentValue['region']]) {
        result[currentValue['region']] = [];
      }

      result[currentValue['region']].push(currentValue);
      return result;
    }, {});
  }

  /**
   * Supprime tous les contrôles existants du formulaire
   */
  private static clearFormControls(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(e => {
      formGroup.removeControl(e, { emitEvent: false });
    });
  }

  /**
   * Construit le formulaire hiérarchique à partir des organismes groupés par région
   */
  private static buildHierarchicalForm(orgForm: FormGroup, orgRegGrouped: any, isFilterActive: boolean, listOfOldSelectedOrganismes: string[]) {
    Object.keys(orgRegGrouped).forEach(regionCode => {
      const regionFormGroup = new FormGroup<any>({});

      // Ajouter les contrôles pour chaque organisme dans cette région
      orgRegGrouped[regionCode].forEach(item => {
        const isSelected = isFilterActive || listOfOldSelectedOrganismes.includes(item.organisme);
        regionFormGroup.addControl(item.organisme, new FormControl(isSelected, null), { emitEvent: false });
      });

      if (regionCode === 'null') {
        this.handleNullRegion(orgForm, regionFormGroup);
      } else {
        orgForm.addControl(regionCode, regionFormGroup, { emitEvent: false });
      }
    });
  }

  /**
   * Gestion spéciale pour les organismes sans région (null)
   */
  private static handleNullRegion(orgForm: FormGroup, regionFormGroup: FormGroup) {
    Object.keys(regionFormGroup.controls).forEach(orgCode => {
      const individualGroup = new FormGroup<any>({});
      individualGroup.addControl(orgCode, regionFormGroup.get(orgCode), { emitEvent: false });
      orgForm.addControl(`${orgCode}-null`, individualGroup, { emitEvent: false });
    });
  }

  static sortFormGroupControls(formGroup: FormGroup): void {
    const controls = { ...formGroup.controls };
    const sortedKeys = Object.keys(controls).sort((a, b) => {
      return a.localeCompare(b);
    });

    Object.keys(controls).forEach(key => {
      formGroup.removeControl(key, { emitEvent: false });
    });

    sortedKeys.forEach(key => {
      formGroup.addControl(key, controls[key], { emitEvent: false });
    });
  }

  static getSelectedValuesFromListeDeroulanteMultiple(obj: { [key: string]: boolean }): string[] {
    if (!obj) {
      return [];
    }

    return Object.keys(obj).filter(key => obj[key]);
  }
}
