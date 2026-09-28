import { Component, Input, OnInit } from '@angular/core';
import { DateUtil } from '@app/shared/utils/DateUtil';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ACTION_HISTORY_DELETE, ACTION_HISTORY_INSERT, ACTION_HISTORY_UPDATE } from '../../model/action-history';
import { SearchHistoryByQueryResult } from '../../model/search-history-by-query';
import { EQUAL, ONE, COMMA, ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-details-action',
  templateUrl: './details-action.component.html',
  styleUrls: ['./details-action.component.scss'],
  standalone: false,
})
export class DetailsActionComponent implements OnInit {
  @Input() modalRef: NgbModalRef | NgbActiveModal;
  @Input() title: string;
  @Input() rowData: SearchHistoryByQueryResult;

  insertionDate: string;

  updateColumnDefs = [
    {
      headerName: 'Nom du champ',
      field: 'nom',
    },
    {
      headerName: 'Valeur avant mises-à-jour',
      field: 'beforeValue',
    },
    {
      headerName: 'Valeur après mises-à-jour',
      field: 'afterValue',
    },
  ];

  createColumnDefs = [
    {
      headerName: 'Nom du champ',
      field: 'nom',
    },
    {
      headerName: 'Valeur',
      field: 'valeur',
    },
  ];

  detail = [];
  columnDefs = {};

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.formateDataBeforeShow();
  }

  formateDataBeforeShow() {
    const valueBeforeUpdate = this.rowData.entree;
    const valueAfterUpdate = this.rowData.sortie;
    const userAction = this.rowData.actionUtilisateur;

    if (userAction === ACTION_HISTORY_INSERT) {
      this.detail = valueAfterUpdate?.split(COMMA).map(val => {
        return { nom: val.split(EQUAL)[ZERO], valeur: val.split(EQUAL)[ONE] };
      });
      this.columnDefs = this.createColumnDefs;
    } else if (userAction === ACTION_HISTORY_UPDATE) {
      const arr = valueBeforeUpdate?.split(COMMA).map(val => {
        return { nom: val.split(EQUAL)[ZERO].trim(), valeur: val.split(EQUAL)[ONE].trim() };
      });
      const entreMap = new Map(arr?.map(val => [val.nom, val.valeur]));
      this.detail = valueAfterUpdate?.split(COMMA).map(val => {
        return {
          nom: val.split(EQUAL)[ZERO].trim(),
          afterValue: val.split(EQUAL)[ONE].trim(),
          beforeValue: entreMap?.get(val.split(EQUAL)[ZERO].trim()) ? entreMap.get(val.split(EQUAL)[ZERO].trim()) : '-',
        };
      });
      this.columnDefs = this.updateColumnDefs;
    } else if (userAction === ACTION_HISTORY_DELETE) {
      this.detail = valueBeforeUpdate?.split(COMMA).map(val => {
        return { nom: val.split(EQUAL)[ZERO], valeur: val.split(EQUAL)[ONE] };
      });
      this.columnDefs = this.createColumnDefs;
    }
    this.insertionDate = DateUtil.formatDateToDDMMYYYYHHMMSS(this.rowData.insertionDate);
  }
}
