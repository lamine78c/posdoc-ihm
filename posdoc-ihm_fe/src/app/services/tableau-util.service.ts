import { Injectable } from '@angular/core';
import { ConfirmationPopupComponent } from '@app/admin/popup/confirmation-popup/confirmation-popup.component';
import { ExtendedColDef } from '@app/fullstack-components/tableau/models/tableau.models';
import { PropertyAuthInterface } from '@app/models/auth/property-auth-interface';
import { ParamColDefInterface } from '@app/models/tableau/param-col-def-interface';
import { ParamColShowInterface } from '@app/models/tableau/param-col-show-interface';
import { PermissionService } from '@app/services/permission/permission.service';
import { KEY_MODIFIER_AUTH, KEY_SUPPRIMER_AUTH } from '@app/services/permission/PermissionsFile';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import merge from 'lodash.merge';

const ACTION_COL_WIDTH = 35;
const DEFAULT_COL_STYLE = {
  headerName: '',
  headerClass: 'no-border',
  sortable: false,
  width: ACTION_COL_WIDTH,
  minWidth: ACTION_COL_WIDTH,
  maxWidth: ACTION_COL_WIDTH,
};

@Injectable({
  providedIn: 'root',
})
export class TableauUtilService {
  constructor(private readonly servicePerm: PermissionService) {}

  private canEdit(auth: PropertyAuthInterface): boolean {
    return this.servicePerm.hasPermission(auth[KEY_MODIFIER_AUTH]);
  }

  private canDelete(auth: PropertyAuthInterface): boolean {
    return this.servicePerm.hasPermission(auth[KEY_SUPPRIMER_AUTH]);
  }

  private baseColDef(overrides: Partial<ExtendedColDef>): ExtendedColDef {
    return { ...DEFAULT_COL_STYLE, ...overrides };
  }

  private getColClearFilterDefAttribut(): ExtendedColDef {
    return this.baseColDef({
      field: 'clearFilter',
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: 'actionRendererClearFilter',
    });
  }

  private getColCollapseDefAtrribut(): ExtendedColDef {
    return this.baseColDef({
      field: 'collapse',
      enableCollapsing: true,
      cellRenderer: 'agGroupCellRenderer',
    });
  }

  private getColEditDefAttribut(auth: PropertyAuthInterface, isPopup = false): ExtendedColDef {
    return this.baseColDef({
      field: isPopup ? 'actionRendererEditPopup' : 'actionRendererEdit',
      cellRenderer: isPopup ? 'actionRendererEditPopup' : 'actionRendererEdit',
      cellRendererParams: {},
      initialHide: !this.canEdit(auth),
    });
  }

  private getColDeleteDefAttribut(auth: PropertyAuthInterface): ExtendedColDef {
    return this.baseColDef({
      field: 'isNotAuthorisedToBeDeleted',
      cellRenderer: 'actionRendererDelete',
      cellRendererParams: { deleteModal: ConfirmationPopupComponent },
      sortable: true,
      initialHide: !this.canDelete(auth),
    });
  }

  // Colonnes combinées
  getColClearFilterWithCollapse(params: Partial<ExtendedColDef> = {}): ExtendedColDef {
    return this.mergeConfigs(Object.assign(this.getColClearFilterDefAttribut(), this.getColCollapseDefAtrribut()), params);
  }

  getColClearFilterWithEdit(propertyAuth: PropertyAuthInterface, params: Partial<ExtendedColDef> = {}, isColEditPopup = false): ExtendedColDef {
    return this.mergeConfigs(Object.assign(this.getColClearFilterDefAttribut(), this.getColEditDefAttribut(propertyAuth, isColEditPopup)), params);
  }

  getColClearFilterWithDelete(propertyAuth: PropertyAuthInterface, params: Partial<ExtendedColDef> = {}): ExtendedColDef {
    return this.mergeConfigs(Object.assign(this.getColClearFilterDefAttribut(), this.getColDeleteDefAttribut(propertyAuth)), params);
  }

  // Colonnes individuelles
  getColClearFilter(params: Partial<ExtendedColDef> = {}): ExtendedColDef {
    return this.mergeConfigs(this.getColClearFilterDefAttribut(), params);
  }

  getColEdit(propertyAuth: PropertyAuthInterface, params: Partial<ExtendedColDef> = {}, isColEditPopup = false): ExtendedColDef {
    return this.mergeConfigs(this.getColEditDefAttribut(propertyAuth, isColEditPopup), params);
  }

  getColDelete(propertyAuth: PropertyAuthInterface, params: Partial<ExtendedColDef>): ExtendedColDef {
    return this.mergeConfigs(this.getColDeleteDefAttribut(propertyAuth), params);
  }

  private mergeConfigs(base: ColDef | ExtendedColDef, custom?: object): ExtendedColDef {
    return merge({}, base, custom || {}) as ExtendedColDef;
  }

  getColsDefAction(
    propertyAuth: PropertyAuthInterface,
    paramColShow: ParamColShowInterface,
    paramColDef: ParamColDefInterface
  ): (ExtendedColDef | ColGroupDef)[] {
    const params = this.getConfigParams(paramColShow, paramColDef);
    const { colEdit, colDelete } = this.getEditAndDeleteColumns(propertyAuth, params);

    if (params.hasSelectAll) {
      return this.buildActionsWithoutClearFilter(propertyAuth, params, colEdit, colDelete);
    } else {
      return this.buildActionsWithClearFilter(propertyAuth, params, colEdit, colDelete);
    }
  }

  private getConfigParams(paramColShow: ParamColShowInterface, paramColDef: ParamColDefInterface) {
    return {
      paramCollapse: paramColDef?.collapse,
      paramEdit: paramColDef?.edit,
      paramDelete: paramColDef?.delete,
      paramClearFilter: paramColDef?.clearFilter,
      hasSelectAll: paramColShow?.isColSelectAll ?? true,
      hasCollapse: paramColShow?.isColCollapse,
      hasEdit: !paramColShow?.isNoColEdit,
      isColEditPopup: paramColShow?.isColEditPopup,
      hasDelete: !paramColShow?.isNoColDelete,
      sortable: paramColShow?.sortable,
    };
  }

  private buildActionsWithoutClearFilter(
    propertyAuth: PropertyAuthInterface,
    params: any,
    colEdit: any[],
    colDelete: any[]
  ): (ExtendedColDef | ColGroupDef<any>)[] {
    const actions = [];

    if (params.hasCollapse) {
      actions.push(this.getColCollapseDefAtrribut());
    }

    if (params.hasEdit && this.servicePerm.hasPermission(propertyAuth[KEY_MODIFIER_AUTH])) {
      actions.push(...colEdit);
    }

    if (params.hasDelete && this.servicePerm.hasPermission(propertyAuth[KEY_SUPPRIMER_AUTH])) {
      actions.push(...colDelete);
    }

    return this.applySortableToActions(actions, params.sortable);
  }

  private buildActionsWithClearFilter(
    propertyAuth: PropertyAuthInterface,
    params: any,
    colEdit: any[],
    colDelete: any[]
  ): (ExtendedColDef | ColGroupDef<any>)[] {
    const firstAction = this.getFirstActionColumnWithClearFilter(propertyAuth, params);
    const actions = [firstAction];

    // Ajouter les actions restantes selon ce qui a été fusionné avec clearFilter
    const hasClearFilterWithCollapse = params.hasCollapse;
    const hasClearFilterWithEdit = !params.hasCollapse && params.hasEdit && this.servicePerm.hasPermission(propertyAuth[KEY_MODIFIER_AUTH]);

    // Ajouter edit si non fusionné avec clearFilter
    if (hasClearFilterWithCollapse && params.hasEdit && this.servicePerm.hasPermission(propertyAuth[KEY_MODIFIER_AUTH])) {
      actions.push(...colEdit);
    }

    // Ajouter delete si non fusionné avec clearFilter
    if ((hasClearFilterWithCollapse || hasClearFilterWithEdit) && params.hasDelete && this.servicePerm.hasPermission(propertyAuth[KEY_SUPPRIMER_AUTH])) {
      actions.push(...colDelete);
    }

    return this.applySortableToActions(actions, params.sortable);
  }

  private getFirstActionColumnWithClearFilter(propertyAuth: PropertyAuthInterface, params: any): ExtendedColDef {
    if (params.hasCollapse) {
      return this.getColClearFilterWithCollapse(params.paramCollapse);
    }

    if (params.hasEdit && this.servicePerm.hasPermission(propertyAuth[KEY_MODIFIER_AUTH])) {
      return this.getColClearFilterWithEdit(propertyAuth, params.paramEdit, params.isColEditPopup);
    }

    if (params.hasDelete && this.servicePerm.hasPermission(propertyAuth[KEY_SUPPRIMER_AUTH])) {
      return this.getColClearFilterWithDelete(propertyAuth, params.paramDelete);
    }

    return this.getColClearFilter(params.paramClearFilter);
  }

  private getEditAndDeleteColumns(propertyAuth: PropertyAuthInterface, params: any): { colEdit: any[]; colDelete: any[] } {
    const editCol = params.hasEdit ? this.getColEdit(propertyAuth, params.paramEdit, params.isColEditPopup) : [];
    const deleteCol = params.hasDelete ? this.getColDelete(propertyAuth, params.paramDelete) : [];

    const colEdit = Array.isArray(editCol) ? editCol : [editCol];
    const colDelete = Array.isArray(deleteCol) ? deleteCol : [deleteCol];

    return { colEdit, colDelete };
  }

  private applySortableToActions(actions: (ExtendedColDef | ColGroupDef<any>)[], sortable?: boolean): (ExtendedColDef | ColGroupDef<any>)[] {
    // Si sortable n'est pas défini, on garde les valeurs par défaut de chaque colonne
    if (sortable === undefined) {
      return actions;
    }

    // Applique le sortable uniquement à la colonne delete (seule colonne avec tri par défaut)
    return actions.map(action => {
      const isDeleteColumn = (action as ExtendedColDef).field === 'isNotAuthorisedToBeDeleted';
      return isDeleteColumn ? { ...action, sortable } : action;
    });
  }
}
