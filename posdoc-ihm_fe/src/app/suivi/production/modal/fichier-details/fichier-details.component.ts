import { Component, inject, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { OngletModal } from '@app/fullstack-components/onglets/models/onglets.models';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ZERO } from '@app/shared/utils/Constants';
import { NgbActiveModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ParamsPopupFichiers } from './models/params-fichiers-interface';
import { DocumentsDematerialisesFichierComponent } from './onglets/documents-dematerialises-fichier/documents-dematerialises-fichier.component';
import { FacturationFichierComponent } from './onglets/facturation-fichier/facturation-fichier.component';
import { GeneralitesFichierComponent } from './onglets/generalites-fichier/generalites-fichier.component';
import { NoticesFichierComponent } from './onglets/notices-fichier/notices-fichier.component';
import { ProduitsFichierComponent } from './onglets/produits-fichier/produits-fichier.component';
import { ApiAdelaideParametreService } from '@app/services/api-adelaide-parametre.service';
import { BehaviorSubject, combineLatest, first, map, Observable, Subscription } from 'rxjs';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-fichier-details',
  templateUrl: './fichier-details.component.html',
  styleUrls: ['./fichier-details.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class FichierDetailsComponent implements OnInit, OnDestroy {
  @Input() params: ParamsPopupFichiers;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) dynamicComponentContainer: ViewContainerRef;

  active = ZERO;
  nextId$: BehaviorSubject<number> = new BehaviorSubject<number>(ZERO);
  labelActif = ZERO;
  tabs: OngletModal[] = [];
  onglets$: Observable<OngletModal[]>;
  modalTitle: string;

  tabChangeSubscription: Subscription;

  public activeModal = inject(NgbActiveModal);
  private readonly permissionsService = inject(PermissionService);
  private readonly apiParametreService: ApiAdelaideParametreService = inject(ApiAdelaideParametreService);

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    this.getTabs();
    this.onglets$ = this.apiParametreService.getValueDocDematerialises().pipe(
      map(result => {
        const param = result.data.getValueDocDematerialises;
        const onglets = this.tabs.filter(e => this.permissionsService.hasPermission(e.perm));
        if (param !== this.params.codapp) {
          return onglets.filter(e => e.label !== 'Documents dématérialisés');
        }
        return onglets;
      }),
      first()
    );

    this.tabChangeSubscription = combineLatest([this.onglets$, this.nextId$]).subscribe(([onglets, nextId]: [OngletModal[], number]) => {
      if (onglets.length > ZERO) {
        this.loadComponent(onglets[nextId].label);
      }
      this.labelActif = this.tabs.findIndex(e => e.label === onglets[nextId].label);
    });

    const fichier = this.params.codcom + this.params.codfic + '-' + this.params.numcom;
    const application = this.params.codenv + '-' + this.params.codorg + '-' + this.params.codapp + ' ' + this.params.percod;
    this.modalTitle = 'Informations détaillées sur le fichier ' + fichier + " de l'occurrence d'application " + application;
  }

  activeChange(event: NgbNavChangeEvent): void {
    this.nextId$.next(event.nextId);
  }

  loadComponent(label: string): void {
    const tab = this.tabs.find(t => t.label === label);
    if (tab) {
      this.dynamicComponentContainer.clear();
      const componentRef = this.dynamicComponentContainer.createComponent(tab.component);
      (componentRef.instance as any).params = this.params;
    }
  }

  getTabs(): void {
    this.tabs = [
      {
        label: 'Généralités',
        component: GeneralitesFichierComponent,
        perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Produits',
        component: ProduitsFichierComponent,
        perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Notices',
        component: NoticesFichierComponent,
        perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Facturation',
        component: FacturationFichierComponent,
        perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
      {
        label: 'Documents dématérialisés',
        component: DocumentsDematerialisesFichierComponent,
        perm: AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID,
      },
    ];
  }

  ngOnDestroy(): void {
    this.dynamicComponentContainer.clear();
  }

}
