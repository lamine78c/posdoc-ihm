import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ScriptPayload } from '../../../models/consulte-script-etape-models';
import { MenuData } from '../../../models/occurrence-etape-interfaces';
import { ApiConsulteScriptEtapeService } from '../../../service/api-consulte-script-etape.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-modal-consulte-script',
  templateUrl: './modal-consulte-script.component.html',
  styleUrls: ['./modal-consulte-script.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class ModalConsulteScriptComponent implements OnInit {
  @Input() menuData: MenuData;
  modalTitle: string;
  consulteScript: string;
  pathIconError = 'assets/icones-showcase/m_error.svg';
  iconToDisplay: string;
  subscriptions: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    public apiConsulteScriptEtapeService: ApiConsulteScriptEtapeService
  ) {}

  ngOnInit(): void {
    this.modalTitle = 'Vidage de ' + this.menuData.script;
    this.getScript();
  }

  setIconEnErrorToDisplay() {
    this.iconToDisplay = this.pathIconError;
  }

  getScript() {
    let params = new ScriptPayload();
    params.script = this.menuData.script;
    this.iconToDisplay = null;
    this.subscriptions.push(
      this.apiConsulteScriptEtapeService
        .consulteScriptEtape(params)
        .pipe(take(1))
        .subscribe(
          result => {
            let erreur = (result as any).data.consulteScriptEtape.error;
            if (erreur) {
              this.consulteScript = erreur;
              this.setIconEnErrorToDisplay();
            } else {
              this.consulteScript = this.formatterScriptEnHtml((result as any).data.consulteScriptEtape.result);
            }
          },
          error => {
            this.consulteScript = error.graphQLErrors[0].message;
            this.setIconEnErrorToDisplay();
          }
        )
    );
  }

  formatterScriptEnHtml(script: string) {
    return script.replaceAll('\n', '<br>').replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;').replaceAll(' ', '&nbsp;');
  }
}
