import { Component, OnDestroy } from '@angular/core';
import { ApiAdelaideOccurenceApplicationService } from '@app/services/api-adelaide-occurrence-application.service';
import { OccurencePerApplication } from '@app/models/supervision/production/occurence-per-application';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-occurrence-application',
  templateUrl: './occurrence-application.component.html',
  styleUrls: ['./occurrence-application.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class OccurrenceApplicationComponent implements OnDestroy {
  dataToSend: OccurencePerApplication[];
  interval: any;
  textStartStop = 'Démarrer';
  searchEvent: any;
  isIntervalStart = false;
  toShowAction = false;
  dateDebut: Date;
  private listerSub?: Subscription;

  constructor(private adelaideOccurenceApplicationService: ApiAdelaideOccurenceApplicationService) {}

  applySearch() {
    this.lister(this.searchEvent);
  }

  lister(event): Promise<void> {
    this.searchEvent = event;
    this.dateDebut = event.currentDate;
    this.toShowAction = false;
    this.listerSub?.unsubscribe();
    return new Promise<void>((resolve) => {
      this.listerSub = this.adelaideOccurenceApplicationService
        .searchOccurencePerApplication(event.currentDate, event.codSite, event.codEnv, event.codOrgs, event.codApp, event.tri, event.ext)
        .subscribe({
          next: result => {
            this.dataToSend = result.data.searchOccurencePerApplication.map((e: OccurencePerApplication, i: number) => ({
              ...e,
              groupId: i + '-' + e.codEnv + e.codOrg + e.codApp + e.perCod + (e.codSit ?? ''),
            }));
            this.toShowAction = true;
            resolve();
          },
          error: () => {
            resolve();
          }
        });
    });
  }

  startStop() {
    const REFRESH_INTERVAL = 10000;
    if (this.interval) {
      // arrêter le video
      clearTimeout(this.interval);
      this.textStartStop = 'Démarrer';
      this.interval = undefined;
      this.isIntervalStart = false;
    } else {
      // démarrer le video
      this.textStartStop = 'Arrêter';
      this.isIntervalStart = true;
      const poll = () => {
        this.lister(this.searchEvent).then(() => {
          if (this.isIntervalStart) {
            this.interval = setTimeout(poll, REFRESH_INTERVAL);
          }
        });
      };
      poll();
    }
  }

  ngOnDestroy(): void {
    this.isIntervalStart = false;
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = undefined;
    }
  }
}
