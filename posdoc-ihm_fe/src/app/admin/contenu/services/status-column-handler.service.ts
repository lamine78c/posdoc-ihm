import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { Observable } from 'rxjs';

export interface StatusColumnConfig {
  draftValue: string;
  enabledValue: string;
  disabledValue: string;
  draftLabel: string;
  enabledLabel: string;
  disabledLabel: string;
  allowDraftChanges?: boolean;
}

export interface OptionElementConfig {
  status: string;
  value: string;
  text: string;
  disabled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StatusColumnHandlerService {
  constructor(private noteService: NotesService) {}

  setupStatusColumnHandler(columnDefs: ColDef[], context: any, config: StatusColumnConfig) {
    const statusCol = columnDefs.find(col => (col as ColDef).field === 'status') as ColDef;
    if (statusCol) {
      statusCol.cellRenderer = (params: any) => this.statusCellRenderer(params, context, config);
    }
  }

  createOptionElement(config: OptionElementConfig) {
    const option = document.createElement('option');
    option.value = config.value;
    option.text = config.text;
    if (config.status === config.value) {
      option.selected = true;
    }
    if (config.disabled) {
      option.disabled = true;
    }
    return option;
  }

  private statusCellRenderer(params: any, context: any, config: StatusColumnConfig) {
    const container = document.createElement('div');
    container.className = 'd-flex';

    const select = document.createElement('select');
    select.className = 'w-100';

    const draftOptionConfig = {
      status: params.data.status,
      value: config.draftValue,
      text: config.draftLabel,
      disabled: true,
    };

    const enabledOptionConfig = {
      status: params.data.status,
      value: config.enabledValue,
      text: config.enabledLabel,
      disabled: false,
    };

    const disabledOptionConfig = {
      status: params.data.status,
      value: config.disabledValue,
      text: config.disabledLabel,
      disabled: false,
    };

    // Pour les brouillons : afficher "Brouillon" (disabled) et gérer selon allowDraftChanges
    if (params.data.status === config.draftValue) {
      select.appendChild(this.createOptionElement(draftOptionConfig));
      select.appendChild(this.createOptionElement(enabledOptionConfig));

      // Désactiver le select si allowDraftChanges est false
      if (!config.allowDraftChanges) {
        select.disabled = true;
      }
    } else {
      // Pour activé/désactivé : afficher les deux options
      select.appendChild(this.createOptionElement(enabledOptionConfig));
      select.appendChild(this.createOptionElement(disabledOptionConfig));
    }

    // Attacher le listener change directement sur le select
    select.addEventListener('change', event => this.onChangeValue(event, params, context, config));

    container.appendChild(select);
    return container;
  }

  onChangeValue(event, params, context, config: StatusColumnConfig) {
    const selectedValue: string = this.normalizeSelectValue((event.target as HTMLSelectElement).value);
    const oldStatusInCaseOfException: string = params.data.status;

    if (!!selectedValue && selectedValue !== params.data.status) {
      // Si on active un brouillon, vérifier avec le composant parent
      if (params.data.status === config.draftValue && selectedValue === config.enabledValue) {
        if (context.onActivateDraft) {
          context.onActivateDraft(params, oldStatusInCaseOfException, selectedValue);
        }
      } else {
        if (context.onChangeStatus) {
          context.onChangeStatus(params, oldStatusInCaseOfException, selectedValue);
        }
      }
    }
  }

  private normalizeSelectValue(value: string): string {
    const parts = value?.split(':');
    if (parts?.length > 1) {
      return parts[1].trim();
    }
    return value;
  }

  changeStatus(
    param: any,
    oldStatus: string,
    newStatus: string,
    apiCall: (id: number, status: string) => Observable<any>,
    onSuccess: () => void,
    successMessage: string
  ) {
    // Convertir de minuscules (UI) vers majuscules (API)
    const apiStatus = newStatus.toUpperCase();

    apiCall(param.data.id, apiStatus).subscribe({
      next: () => {
        onSuccess();
        this.noteService.show({
          title: successMessage,
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
      },
      error: error => {
        param.node.data.status = oldStatus;
        param.api.redrawRows({ rowNodes: [param.node] });
        this.noteService.show({
          title: error.graphQLErrors?.[0]?.message || 'Erreur lors de la mise à jour du statut',
          classname: 'note-erreur',
          category: ToastCategoryEnum.ERROR,
        });
      },
    });
  }
}
