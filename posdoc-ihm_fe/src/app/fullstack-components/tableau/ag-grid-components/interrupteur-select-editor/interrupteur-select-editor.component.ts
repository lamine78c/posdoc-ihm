import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExemplaireByResource } from '@app/models/exemplaire-by-resource';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { ZERO } from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-interrupteur-select-editor',
  templateUrl: './interrupteur-select-editor.component.html',
  styleUrls: ['./interrupteur-select-editor.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class InterrupteurSelectEditorComponent implements ICellRendererAngularComp {
  // Formulaire
  form: FormGroup;
  // paramètres ag grid
  params;
  // donnée du select
  data;
  // controle d'affichage cliquable ou pas
  isAllTimeClickable = true;
  // Contrôle l'affichage du sélecteur
  isHidden = false;
  private readonly fb = inject(FormBuilder);
  private readonly editorService = inject(EditorService);

  subscriptions: Subscription[] = [];

  constructor() {
    // do nothing
  }

  agInit(params: any): void {
    this.params = params;
    this.initForm();
    this.checkIfHidden();
    this.updateIsAllTimeClickable();
    // si les données brut existe on les sélectionne, si non, on s'inscrit pour les recevoir
    if (params.values && params.values.length > ZERO) {
      this.data = params.values;
    } else {
      this.filterData();
    }
    this.onValueChange();
  }

  onValueChange() {
    this.subscriptions.push(this.form.get(this.params.formKey).valueChanges.subscribe(value => this.params.setValue(value)));
  }

  private updateIsAllTimeClickable() {
    // Vérifie si l'input est cliquable à tout moment
    this.isAllTimeClickable = (this.params.isAllTimeClickable && !this.params.data?.isDataConsul) ?? true;
    // Si on est dans le mode édition et la cellule n'est pas en édition
    if (this.params.colDef.cellRendererParams.isEditing && !this.editorService.getIsEditing(this.params)) {
      // la cellule n'est pas clickable
      this.isAllTimeClickable = false;
    }
  }

  private filterData() {
    this.subscriptions.push(
      this.params?.selectData.subscribe(e => {
        if (!!this.params.filterByFields?.length) {
          this.data = SharedUtil.getUniqueList(
            e.filter(vl =>
              this.params.filterByFields.every(field =>
                field === this.params.acceptGenericOrgs?.key && !!this.params.acceptGenericOrgs
                  ? vl[field] === this.params.acceptGenericOrgs.value || vl[field] === this.params.data[field]
                  : vl[field] === this.params.data[field]
              )
            ),
            'value'
          );
          // Si pas de données, afficher uniquement la donnée actuelle
          if (this.data.length === ZERO && !!this.params.data[this.params.formKey]) {
            this.data = [
              {
                value: this.params.data[this.params.formKey],
                text: this.params.data[this.params.formKey],
              },
            ];
          }
        } else {
          this.data = e;
        }
      })
    );
  }

  private initForm(): void {
    const validators = this.params.validators || [];
    this.form = this.fb.group({
      [this.params.formKey]: [{ value: this.params.value, disabled: !(this.params.isAllTimeClickable ?? true) }, validators],
    });
  }

  private checkIfHidden(): void {
    if (this.params.exemplaires) {
      const codorg = this.params.data.codorg;
      const codcom = this.params.data.codcom;
      const codfic = this.params.data.codfic;
      const colId: string = this.params.column.colId;
      const exemplaire = this.params.exemplaires.find((e: ExemplaireByResource) => {
        return e.codorg === codorg && e.codcom === codcom && e.codfic === codfic;
      });
      this.isHidden = !exemplaire?.ressources.some(resource => colId.includes(resource.codres) && colId.includes(resource.codsit));
    }
  }

  /**********************/
  /**     AG GRID      **/
  /**********************/
  refresh(): boolean {
    return false;
  }
}
