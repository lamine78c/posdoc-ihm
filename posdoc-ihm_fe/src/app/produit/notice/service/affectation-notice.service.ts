import { Injectable } from '@angular/core';
import { NotesService } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauAffectationNoticeService } from '@app/produit/notice/service/tableau-affectation-notice.service';
import { DataService } from '@app/shared/utils/data.service';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TableauModifiableService } from '@app/fullstack-components/tableau/services/tableau-modifiable.service';
import { PopupConfirmationService } from '@app/shared/services/PopupConfirmationService';

@Injectable({
  providedIn: 'root',
})
export class AffectationNoticeServiceAggregator {
  constructor(
    public tableauConfigurationBuilderService: TableauConfigurationBuilderService,
    public tableauAffectationNoticeService: TableauAffectationNoticeService,
    public tableauModifiableService: TableauModifiableService,
    public changeNotSubmitedConfirmationService: PopupConfirmationService,
    public dataService: DataService,
    public modalService: NgbModal,
    public noteService: NotesService,
    public datePipe: DatePipe
  ) {
    //No - op
  }
}
