import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss'],
  standalone: false,
})
export class ConfirmationPopupComponent implements OnInit {
  @Input() messages: any[] = [];

  @Input() rowsToDelete: any;

  @Input() rowsNotAuthorisedToBeDeleted: any;

  @Input() idsLabel: string[];

  @Input() idsLabelSeparator: string;

  @Input() firstButtonLabel = 'Confirmer suppression';

  @Input() secondButtonLabel = 'Abandonner suppression';

  title: string;

  rowsNotAuthorisedMessage: string;

  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit(): void {
    this.transformeMessage();
    this.title = this.messages[0];
    if (this.isPluralTitle()) {
      this.title = this.messages[3];
    }
    if (this.rowsNotAuthorisedToBeDeleted.length > 1) {
      this.rowsNotAuthorisedMessage = this.messages[4];
    } else {
      this.rowsNotAuthorisedMessage = this.messages[5];
    }
  }

  isPluralTitle(): boolean {
    return (
      (this.rowsToDelete.length > 1 ||
        this.rowsNotAuthorisedToBeDeleted.length > 1 ||
        this.rowsToDelete.length + this.rowsNotAuthorisedToBeDeleted.length === 2) &&
      this.messages[3]
    );
  }

  /**
   * Cette fonction permets de remplacer le variable par la règle définie dans messages[6]:
   * ex : messages[6] = { '***': 'codnot' } va remplacer '***' par rowsToDelete[0]['codnot'] si trouve dans message[0][1][2][3][4][5]
   */
  transformeMessage() {
    if (this.messages.length > 6) {
      const row = this.rowsToDelete[0];
      const rules = this.messages[6];
      if (!row || !rules) return;
      this.messages = this.messages.map(value => {
        if (typeof value !== 'string') return value;
        let result = value;
        Object.keys(rules).forEach(placeholder => {
          const rowKey = rules[placeholder];
          result = result.replaceAll(placeholder, row[rowKey] ?? placeholder);
        });
        return result;
      });
    }
  }
}
