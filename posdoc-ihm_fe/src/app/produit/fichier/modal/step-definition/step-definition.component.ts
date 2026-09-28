import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiAdelaideCommandeService } from '@app/services/api-adelaide-commande.service';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { Subject, Subscription, take } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-step-definition',
  templateUrl: './step-definition.component.html',
  styleUrls: ['./step-definition.component.scss'],
  standalone: false,
})
export class StepDefinitionComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() allOrgReg: [{ code: string; codeRegion: string }];

  applicationOptions = [];
  @Input() commandeOptions = [];

  @Output() commandeOptionsChange: EventEmitter<any> = new EventEmitter<any>();

  // environnement selectionner
  envSelected = [];

  noOrganismFound = false;

  subscriptions: Subscription[] = [];

  private searchFichier$ = new Subject<string>();

  constructor(private apiCommandeService: ApiAdelaideCommandeService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.apiCommandeService.getDistinctApplications().pipe(take(1)).subscribe(data => {
        this.applicationOptions = (data as any).data.getDistinctApplications;
      })
    );

    this.subscriptions.push(
      this.searchFichier$
        .pipe(
          debounceTime(700),
          switchMap(() => {
            const dataDef = this.form.getRawValue();
            const envs = Object.keys(dataDef.environnement).filter(envKey => dataDef.environnement[envKey]);
            return this.apiCommandeService.getDistinctOrg(envs, dataDef.application, dataDef.commande, dataDef.fichier);
          })
        )
        .subscribe(data => {
          this.updateOrganismList((data as any).data.getDistinctOrg);
        })
    );

    this.subscriptions.push(
      this.form.get('fichier').valueChanges.subscribe(fic => {
        if (fic) {
          this.searchFichier$.next(fic);
        } else {
          const orgForm = this.form.get('organisme') as FormGroup;
          orgForm.reset(false, { emitEvent: false });
          Object.keys(orgForm.controls).forEach(key => orgForm.removeControl(key));
          this.noOrganismFound = false;
        }
      })
    );

    this.subscriptions.push(
      this.form.get('commande').valueChanges.subscribe(() => {
        if (this.form.get('fichier').value) {
          this.searchFichier$.next(this.form.get('fichier').value);
        } else {
          const orgForm = this.form.get('organisme') as FormGroup;
          orgForm.reset(false, { emitEvent: false });
          Object.keys(orgForm.controls).forEach(key => orgForm.removeControl(key));
          this.noOrganismFound = false;
        }
      })
    );
  }

  updateOrganismList(organismes: any): void {
    const orgForm = this.form.get('organisme') as FormGroup;
    SharedUtil.getOrgFormByOrgData(orgForm, organismes, this.allOrgReg, false);
    this.noOrganismFound = !organismes || organismes.length === 0;
  }

  /**
   * Mise à jour du formulaire validée
   */
  changeApplication(selected): void {
    this.subscriptions.push(
      this.apiCommandeService.getDistinctEnvsByApp(selected).pipe(take(1)).subscribe(data => {
        const env = (data as any).data.getDistinctEnvsByApp;
        const envForm = this.form.get('environnement') as FormGroup;
        Object.keys(envForm.controls).forEach(key => envForm.removeControl(key, { emitEvent: false }));
        envForm.reset(false, { emitEvent: true });
        // supprimeles element pour en creer d'autre
        env.forEach(i => {
          envForm.addControl(i as string, new FormControl(false, null), { emitEvent: false });
        });
      })
    );

    this.commandeOptions = [];
    this.form.get('commande').reset(false, { emitEvent: false });
    const orgForm = this.form.get('organisme') as FormGroup;
    orgForm.reset(false, { emitEvent: true });
    Object.keys(orgForm.controls).forEach(key => orgForm.removeControl(key, { emitEvent: false }));
    this.noOrganismFound = false;
  }

  changeEnvironnement(selected) {
    this.envSelected = selected.map(e => e.title);

    // Clear command options and reset command value
    this.commandeOptions = [];
    this.form.get('commande').reset('', { emitEvent: false });

    this.subscriptions.push(
      this.apiCommandeService.getDistinctCommByAppEnv(this.form.get('application').value, this.envSelected).pipe(take(1)).subscribe(data => {
        this.commandeOptions = (data as any).data.getDistinctCommByAppEnv;
        this.commandeOptionsChange.emit(this.commandeOptions);
      })
    );

    const orgForm = this.form.get('organisme') as FormGroup;
    orgForm.reset(false, { emitEvent: false });
    Object.keys(orgForm.controls).forEach(key => orgForm.removeControl(key));
    this.noOrganismFound = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }
}
