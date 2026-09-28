import { Component, inject, Input, OnInit } from '@angular/core';
import { ApiAdelaideHelpService } from '@app/services/api-adelaide/admin/help/api-adelaide-help.service';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { TYPE_STATE_HELP } from '@app/shared/utils/Constants_help';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class HelpComponent implements OnInit {
  @Input() path: string;
  @Input() aideMessage: string;
  private readonly apiAdelaideHelpService = inject(ApiAdelaideHelpService);
  message = "<p>Ce point de menu ne bénéficie pas d'aide.</p>";
  subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    if (this.aideMessage) {
      // Si le message est passé en Input (depuis le tableau admin), l'utiliser directement
      this.message = this.aideMessage;
    } else {
      // Sinon, charger depuis le back (comportement par défaut)
      this.loadMessage();
    }
  }

  loadMessage() {
    this.subscriptions.push(
      this.apiAdelaideHelpService.getPublicationByPath(this.path).pipe(take(1)).subscribe(data => {
        const helpPublished = data.data.getPublication.find(row => row.state === TYPE_STATE_HELP.ENABLED);
        if (helpPublished) {
          this.message = helpPublished.message;
        }
      })
    );
  }
}
