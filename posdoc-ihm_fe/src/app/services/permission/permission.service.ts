import { Injectable } from '@angular/core';
import { AUTH, KEY_AJOUTER_AUTH, KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from './PermissionsFile';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  profilePermissions = [];
  profile: string;

  constructor() {
    // do nothing
  }

  /**
   * vérifier si il a une cette permission
   * @param perm identifiant de la permission a vérifier
   * @returns si oui ou non il a la permission.
   */
  hasPermission(perm): boolean {
    if (this.profilePermissions.length == 0) this.profilePermissions = JSON.parse(sessionStorage.getItem('permissions'));
    return this.profilePermissions?.map(e => e.id).includes(perm);
  }

  /**
   * mis à jours les permissio pour l'utilisatuer actif
   * @param permissionsliste des permissions (habilitations)
   */
  setPermissions(permissions) {
    if (permissions == null) return;
    this.profilePermissions = permissions;
    sessionStorage.setItem('permissions', JSON.stringify(permissions));
  }

  /**
   * mis à jour le profile pour l'utilisateur actif
   * @param profile
   * @returns
   */
  setProfile(profile) {
    if (profile == null) return;
    this.profile = profile;
    sessionStorage.setItem('profile', profile);
  }

  /**
   * vérifier si l'utilisateur actif a un profile administrateur
   * @returns
   */
  hasProfileAdmin(): boolean {
    if (!this.profile) this.profile = sessionStorage.getItem('profile');
    return this.profile === 'NAT_ADMINISTRATEUR';
  }

  /**
   * vérifier si l'utilisateur actif a le droit de faire une action de masse sur un objet d'autorisation
   * @param permission l'objet d'autorisation contenant les permissions
   * @returns
   */
  hasActionDeMasse(permission): boolean {
    switch (permission) {
      case AUTH.EXPLOITATION_EDITIQUE.MASSIFICATIONS:
        return this.hasActionDeMasseForMassifications(permission);

      case AUTH.EXPLOITATION_EDITIQUE.REEDITIONS.REEDITION_MASSIFICATION:
        return this.hasActionDeMasseForReeditionMassification(permission);

      case AUTH.EXPLOITATION_EDITIQUE.REEDITIONS.REEDITION_PRODUIT:
        return this.hasActionDeMasseForReeditionProduit(permission);

      case AUTH.EXPLOITATION_EDITIQUE.REEDITIONS.REEDITION_RESSOURCE:
        return this.hasActionDeMasseForReeditionRessource(permission);

      case AUTH.FICHIER_EDITION.DESTINATAIRES:
        return this.hasActionDeMasseForDestinataires(permission);

      case AUTH.FICHIER_EDITION.FONDS_DE_PAGE.REFERENCES:
        return this.hasActionDeMasseForFondDePageReferences(permission);

      case AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE:
        return this.hasActionDeMasseForParamEditionEnListe(permission);

      case AUTH.ADMINISTRATION.TARPOS:
        return this.hasActionDeMasseForTarpos(permission);

      case AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES:
        return this.hasActionDeMasseForAffectationNotices(permission);

      case AUTH.SUIVI.BONS_TRAVAIL:
        return this.hasActionDeMasseForSuiviBonDeTravail(permission);

      case AUTH.EXPLOITATION_EDITIQUE.CONTROLE_INTEGRITE_PROD:
        return this.hasActionDeMasseForControleIntegriteProd(permission);

      default:
        return this.hasActionDeMasseForPageAddUpdateDelete(permission);
    }
  }

  hasActionDeMasseForPageAddUpdateDelete(permission) {
    return this.hasPermission(permission[KEY_SUPPRIMER_AUTH]) || this.hasPermission(permission[KEY_AJOUTER_AUTH]);
  }

  hasActionDeMasseForAffectationNotices(permission) {
    return this.hasPermission(permission[KEY_SUPPRIMER_AUTH]) || this.hasPermission(permission[KEY_MODIFIER_AUTH]);
  }

  hasActionDeMasseForTarpos(permission) {
    return this.hasActionDeMasseForPageAddUpdateDelete(permission) || this.hasPermission(permission.detail);
  }

  hasActionDeMasseForMassifications(permission) {
    return (
      this.hasPermission(permission.massifier) ||
      this.hasPermission(permission.simuler) ||
      this.hasPermission(permission.delester) ||
      this.hasPermission(permission[KEY_SUPPRIMER_AUTH])
    );
  }

  hasActionDeMasseForReeditionMassification(permission) {
    return this.hasPermission(permission.valider);
  }

  hasActionDeMasseForReeditionProduit(permission) {
    return this.hasPermission(permission.valider);
  }

  hasActionDeMasseForReeditionRessource(permission) {
    return this.hasPermission(permission.valider);
  }

  hasActionDeMasseForDestinataires(permission) {
    return this.hasPermission(permission[KEY_SUPPRIMER_AUTH]);
  }

  hasActionDeMasseForFondDePageReferences(permission) {
    return this.hasPermission(permission[KEY_MODIFIER_AUTH]);
  }

  hasActionDeMasseForParamEditionEnListe(permission) {
    return (
      this.hasPermission(permission[KEY_SUPPRIMER_AUTH]) ||
      this.hasPermission(permission[KEY_MODIFIER_AUTH]) ||
      this.hasPermission(permission[KEY_AJOUTER_AUTH])
    );
  }

  hasActionDeMasseForSuiviBonDeTravail(permission) {
    return this.hasPermission(permission[KEY_MODIFIER_AUTH]);
  }

  hasActionDeMasseForControleIntegriteProd(permission) {
    return this.hasPermission(permission.invalider);
  }
}
