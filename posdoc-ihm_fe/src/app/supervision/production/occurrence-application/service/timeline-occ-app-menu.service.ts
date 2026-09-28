import { EventEmitter, inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { OngletsParamDataModel } from '@app/models/supervision/production/details/onglets-paramData-model';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import {
  APP_OCCURRENCES_STATUS_CREATED,
  APP_OCCURRENCES_STATUS_DELETED,
  APP_OCCURRENCES_STATUS_SUSPENDED,
  APP_OCCURRENCES_STATUS_TERMINATED,
  getFormIndex,
} from '@app/shared/utils/Constants';
import { DataSearchFromSession, SessionDataSearchService } from '@app/shared/utils/session-data-search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GestionOccurrenceApplicationModalComponent } from '../../gestion-occurrence-application/modal/gestion-occurrence-application-modal/gestion-occurrence-application-modal.component';
import { GestionOccurrenceEtapeModalComponent } from '../../gestion-occurrence-etape/modal/gestion-occurrence-etape-modal.component';
import { DetailsModalComponent } from '@app/shared/components/modal/details/details-modal.component';
import {
  MENU_TIMELINE_OCC_APP_APP_OCC,
  MENU_TIMELINE_OCC_APP_BILL,
  MENU_TIMELINE_OCC_APP_DETAIL,
  MENU_TIMELINE_OCC_APP_RET_PRT,
  MENU_TIMELINE_OCC_APP_RET_RES,
  MENU_TIMELINE_OCC_APP_STP_OCC,
  MENU_TIMELINE_OCC_APP_STP_VIDEO,
  MenuTimeLineOccAppInterface,
} from '../model/timeline-menu';

@Injectable({
  providedIn: 'root',
})
export class TimelineOccAppMenuService {
  private readonly permissionsService = inject(PermissionService);
  private readonly sessionDataSearchService = inject(SessionDataSearchService);
  private readonly modalService = inject(NgbModal);
  private readonly router = inject(Router);
  private readonly formIndex = getFormIndex();

  openStepsVideo(selectedItem) {
    this.sessionDataSearchService.setDataSearchToSession(this.getSearchData(selectedItem));
    const params: any = MENU_TIMELINE_OCC_APP_STP_VIDEO.param;
    this.navigateTo(params.path, params.fragment);
  }

  openReeditByProduct(selectedItem) {
    this.sessionDataSearchService.setDataSearchToSession(this.getSearchData(selectedItem));
    const params: any = MENU_TIMELINE_OCC_APP_RET_PRT.param;
    this.navigateTo(params.path, params.fragment);
  }

  openReeditByResource(selectedItem) {
    this.sessionDataSearchService.setDataSearchToSession(this.getSearchData(selectedItem));
    const params: any = MENU_TIMELINE_OCC_APP_RET_RES.param;
    this.navigateTo(params.path, params.fragment);
  }

  openBilling(selectedItem) {
    this.sessionDataSearchService.setDataSearchToSession(this.getSearchData(selectedItem));
    const params: any = MENU_TIMELINE_OCC_APP_BILL.param;
    this.navigateTo(params.path, null);
  }

  openPopupDetails(selectedItem) {
    this.openPopup(DetailsModalComponent, selectedItem);
  }

  openPopupStepOccurrences(selectedItem) {
    this.openPopup(GestionOccurrenceEtapeModalComponent, selectedItem);
  }

  openPopupApplicationOccurrences(selectedItem, event: EventEmitter<any>) {
    const modalRef = this.openPopup(GestionOccurrenceApplicationModalComponent, selectedItem);
    modalRef.componentInstance.passEntry.subscribe(data => {
      // si terminaison réussie,
      if (data.terminaison) {
        // ferme le popup
        modalRef.close();
        // déclencher l'évènement
        event.emit();
      }
    });
  }

  navigateTo(path: string, fragment: string) {
    // ajout param isInitDataSearchWithSession pour certaine page avec la recherche indépendante(par ex: réédition par produit)
    const navigationExtras: NavigationExtras = {
      state: {
        isInitDataSearchWithSession: true,
      },
    };
    if (fragment) {
      navigationExtras.fragment = fragment;
    }
    this.router.navigate([path], navigationExtras);
  }

  openPopup(modalComponent: any, selectedItem) {
    const modalRef = this.modalService.open(modalComponent);
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.paramData = this.getParamData(selectedItem);
    modalRef.componentInstance.displayFilterButton = true;
    return modalRef;
  }

  getParamData(data): OngletsParamDataModel {
    const paramData = new OngletsParamDataModel();
    paramData.codEnv = data.codenv;
    paramData.codOrg = data.codorg;
    paramData.codApp = data.codapp;
    paramData.perCod = data.percod;
    return paramData;
  }

  getSearchData(data): DataSearchFromSession {
    let searchData = this.sessionDataSearchService.initDataSearchFromSession();
    searchData[this.formIndex.ENVIRONNEMENT] = [data.codenv];
    searchData[this.formIndex.ORGANISME] = [data.codorg];
    searchData[this.formIndex.APPLICATION] = data.codapp;
    searchData[this.formIndex.PERIODE] = data.percod;
    return searchData;
  }

  handleAction(action: string, selectedItem, event: EventEmitter<any>): void {
    if (typeof this[action] === 'function') {
      this[action].call(this, selectedItem, event);
    }
  }

  onMenuOptionClick(option: MenuTimeLineOccAppInterface, selectedItem, event: EventEmitter<any>): void {
    this.handleAction(option.action, selectedItem, event);
  }

  getMenuDetail() {
    return MENU_TIMELINE_OCC_APP_DETAIL;
  }

  getMenuStepsVideo() {
    return this.permissionsService.hasPermission(AUTH.SUPERVISION.PRODUCTION.OCCURENCES_ETAPES.ID) ? MENU_TIMELINE_OCC_APP_STP_VIDEO : null;
  }

  getMenuStepOccurrences() {
    return this.permissionsService.hasPermission(AUTH.SUPERVISION.PRODUCTION.GESTION_OCCURENCES_ETAPES.ID) ? MENU_TIMELINE_OCC_APP_STP_OCC : null;
  }

  getMenuApplicationOccurrences() {
    return this.permissionsService.hasPermission(AUTH.SUPERVISION.PRODUCTION.GESTION_OCCURENCES_APPLICATION.ID)
      ? MENU_TIMELINE_OCC_APP_APP_OCC
      : null;
  }

  getMenuReeditByProduct() {
    return this.permissionsService.hasPermission(AUTH.EXPLOITATION_EDITIQUE.REEDITIONS.REEDITION_PRODUIT.ID) ? MENU_TIMELINE_OCC_APP_RET_PRT : null;
  }

  getMenuReeditByResource() {
    return this.permissionsService.hasPermission(AUTH.EXPLOITATION_EDITIQUE.REEDITIONS.REEDITION_RESSOURCE.ID) ? MENU_TIMELINE_OCC_APP_RET_RES : null;
  }

  getMenuBilling() {
    return this.permissionsService.hasPermission(AUTH.EXPLOITATION_EDITIQUE.CONSOLIDATION_FACTURATION.ID) ? MENU_TIMELINE_OCC_APP_BILL : null;
  }

  getMenuByStatus(status: string) {
    return this.getMenuDef(status).filter(item => item !== null);
  }

  getMenuDef(status: string) {
    switch (status) {
      case APP_OCCURRENCES_STATUS_DELETED:
      case APP_OCCURRENCES_STATUS_SUSPENDED:
        return [
          this.getMenuDetail(),
          this.getMenuStepsVideo(),
          this.getMenuStepOccurrences(),
          this.getMenuApplicationOccurrences(),
          this.getMenuReeditByProduct(),
          this.getMenuReeditByResource(),
          this.getMenuBilling(),
        ];
      case APP_OCCURRENCES_STATUS_CREATED:
        return [this.getMenuDetail(), this.getMenuStepsVideo(), this.getMenuStepOccurrences(), this.getMenuApplicationOccurrences()];
      case APP_OCCURRENCES_STATUS_TERMINATED:
        return [this.getMenuDetail(), this.getMenuStepsVideo(), this.getMenuReeditByProduct(), this.getMenuReeditByResource(), this.getMenuBilling()];
      default:
        return [];
    }
  }
}
