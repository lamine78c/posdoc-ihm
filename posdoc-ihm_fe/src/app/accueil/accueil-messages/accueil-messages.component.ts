import { Component, inject, OnInit } from '@angular/core';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { FIVE, ZERO } from '@app/shared/utils/Constants';
import { ColDef, GridOptions } from 'ag-grid-community';
import { map, Observable, shareReplay, startWith, switchMap } from 'rxjs';
import { TableauAccueilMessagesService } from './service/tableau-accueil-messages.service';
import { LoginService } from '@acoss/prisme-angular-intranet';
import { ApiAdelaideOrganismeService } from '@app/services/api-adelaide-organisme.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ContenuForAccueil, ContenuForAccueilInterface } from '@app/models/contenu-for-accueil';
import { ApolloQueryResult } from 'apollo-client';
import { Organisme } from '@app/models/organisme';
import DOMPurify from 'dompurify';
import { ApiAdelaideRegionService } from '@app/services/api-adelaide-region.service';
import { AllRegionsInterface } from '@app/models/accueil/all-regions-interface';

@Component({
  selector: 'app-accueil-messages',
  templateUrl: './accueil-messages.component.html',
  styleUrl: './accueil-messages.component.scss',
  standalone: false,
})
export class AccueilMessagesComponent implements OnInit {
  gridOptions: GridOptions;
  columnDefs: ColDef[];
  messages$: Observable<ContenuForAccueil[]>;
  allRegions$: Observable<string[]>;
  tooltips$: Observable<Record<string, string>>;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly loginService = inject(LoginService);
  private readonly tableauConfigurationBuilderService = inject(TableauConfigurationBuilderService);
  private readonly tableauAccueilMessagesService = inject(TableauAccueilMessagesService);
  private readonly apiContenuService = inject(ApiAdelaideContenuService);
  private readonly apiOrganismeService = inject(ApiAdelaideOrganismeService);
  private readonly apiAdelaideRegionService = inject(ApiAdelaideRegionService);

  ngOnInit(): void {
    this.initGridOptions();
    this.initColumnDefs();
    this.initRowData();
    this.initAllRegions();
    this.initTooltips();
  }

  private initGridOptions(): void {
    this.gridOptions = this.tableauConfigurationBuilderService.createGridConfiguration();
  }

  private initColumnDefs(): void {
    this.columnDefs = this.tableauAccueilMessagesService.getColumnDefs();
  }

  private initRowData(): void {
    const regions = this.loginService.getInfos().infosUtilisateurFront.access.map(e => e.split(':')[ZERO].substring(ZERO, FIVE));
    this.messages$ = this.apiOrganismeService.getCodesOrganismesByRegions(regions).pipe(
      switchMap((result: ApolloQueryResult<Organisme>) => {
        const codorgs = result.data.getCodesOrganismesByRegions;
        return this.apiContenuService.getContenusForAccueil(codorgs);
      }),
      map((result: ApolloQueryResult<ContenuForAccueilInterface>) =>
        result.data.getContenusForAccueil.map((contenu, index) => {
          contenu.index = index;
          const cleanHtml = DOMPurify.sanitize(contenu.message);
          contenu.sanitizedMessage = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
          return contenu;
        })
      )
    );
  }

  private initAllRegions(): void {
    this.allRegions$ = this.apiAdelaideRegionService.getAllRegions().pipe(
      map((result: ApolloQueryResult<AllRegionsInterface>) => result.data.allRegions.map(region => region.code)),
      shareReplay(1),
      startWith([])
    );
  }

  private initTooltips(): void {
    this.tooltips$ = this.messages$.pipe(
      switchMap(messages => {
        return this.allRegions$.pipe(
          map(allRegions => {
            const tooltips: Record<string, string> = {};
            for (const message of messages) {
              const key = message.index;
              if (JSON.stringify(allRegions) === JSON.stringify(message.regions)) {
                tooltips[key] = 'Régions: Toutes';
              } else {
                tooltips[key] = `Régions: ${message.regions?.join(', ')}`;
              }
            }
            return tooltips;
          })
        );
      })
    );
  }
}
