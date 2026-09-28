import { Component, Input, OnInit } from '@angular/core';
import { IncidentsOccEtapeInterface } from '@app/models/supervision/production/details/incidents-interface';
import { ApiIncidentsService } from '@app/services/api-adelaide/supervision/production/details/api-incidents.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { MenuData } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-details-incidents-occurrence-etape',
  templateUrl: './details-incidents-occurrence-etape.component.html',
  styleUrls: ['./details-incidents-occurrence-etape.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DetailsIncidentsOccurrenceEtapeComponent implements OnInit {
  @Input() paramData: MenuData;
  occurenceData: any[] = [];
  subscriptions: Subscription[] = [];

  constructor(private apiIncidentsService: ApiIncidentsService) {}

  ngOnInit(): void {
    this.getDetails();
  }

  getDetails() {
    this.occurenceData = [];
    this.subscriptions.push(
      this.apiIncidentsService
        .getIncidentsByIdetap(this.paramData.idetap, this.paramData.idtfus)
        .pipe(take(1))
        .subscribe(response => {
          this.occurenceData = [];
          response.data.getIncidentsByIdetap.forEach((responseData: IncidentsOccEtapeInterface) => {
            this.occurenceData.push({
              date: SharedUtil.formatDateToDDMMYYYYHHMMSS(responseData.dcreat),
              message: responseData.mesano,
              script: responseData.script,
            });
          });
        })
    );
  }
}
