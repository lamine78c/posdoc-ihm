import { inject, Injectable } from '@angular/core';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { MenuOption } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  permissionsService = inject(PermissionService);

  async getMenuOptions(type: string, status: string, hasScript: boolean): Promise<MenuOption[]> {
    const test = await this.getOptions(type, status, hasScript);
    return test.map(e => ({
      label: e.label,
      action: e.action,
    }));
  }

  getOptions(type: string, status: string, hasScript: boolean): Promise<MenuOption[]> {
    return new Promise(resolve => {
      const canValider = this.hasPermissionToValidate(status, type),
        canInvalider = this.hasPermissionToInvalidate(status, type),
        showWuxvca = this.hasPermissionToShowWuxvca(type);
      return resolve(this.getMenuOptionsData(hasScript, canValider, canInvalider, showWuxvca));
    });
  }

  hasPermissionToGestionOccurencesEtapes() {
    return this.permissionsService.hasPermission(AUTH.SUPERVISION.PRODUCTION.GESTION_OCCURENCES_ETAPES.ID);
  }

  hasPermissionToValidate(status: string, type: string): boolean {
    if (!this.hasPermissionToGestionOccurencesEtapes()) {
      return false;
    }
    if (['T', 'H', 'I'].includes(status)) {
      return !(type != 'FIN' && (status == 'T' || status == 'I'));
    }
    return ['C', 'D', 'S'].includes(status);
  }

  hasPermissionToInvalidate(status: string, type: string): boolean {
    if (!this.hasPermissionToGestionOccurencesEtapes()) {
      return false;
    }
    if (['C', 'D', 'S', 'V'].includes(status)) {
      return !(type == 'FIN' || type == 'DEB');
    }
    return false;
  }

  hasPermissionToShowWuxvca(type: string): boolean {
    return type == 'MSP';
  }

  getMenuOptionsData(hasScript: boolean, canValider: boolean, canInvalider: boolean, showWuxvca: boolean): MenuOption[] {
    // Options de menu de base
    const menuOptions: MenuOption[] = [{ label: "Plus d'info...", action: 'getMoreInformations' }];
    // Options conditionnelles en fonction des paramètres
    const scriptOptions: MenuOption[] = hasScript
      ? [
          { label: 'Consultation du script...', action: 'consulteScript' },
          { label: 'Consultation de la trace du script...', action: 'consulteTraceAndScript' },
        ]
      : [];
    const validationOptions: MenuOption[] = canValider ? [{ label: "Valider l'étape", action: 'validateStep' }] : [];
    const invalidationOptions: MenuOption[] = canInvalider ? [{ label: "Invalider l'étape + liens", action: 'invalidateStep' }] : [];
    const wuxvcaOptions: MenuOption[] = showWuxvca ? [{ label: "Gestion des dates d'expédition...", action: 'manageExpeditionDates' }] : [];
    // Construction finale de la liste des options de menu
    return [...menuOptions, ...scriptOptions, ...validationOptions, ...invalidationOptions, ...wuxvcaOptions];
  }
}
