import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import CustomValidators from '@app/shared/utils/CustomValidators';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-details-param-distr',
  templateUrl: './details-param-distr.component.html',
  styleUrls: ['./details-param-distr.component.scss'],
  standalone: false,
})
export class DetailsParamDistrComponent {
  form: FormGroup;

  isEditing = false;

  displayErrorsFn;

  params;

  subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder) {}

  agInit(params: any): void {
    this.params = params;
    this.isEditing = params.node.parent.__objectId === params.rowIdEdit;

    this.form = this.fb.group({
      commandeDistribution: [{ value: params.data.commandeDistribution, disabled: !this.isEditing }, CustomValidators.required()],
    });

    this.subscriptions.push(
      this.form.valueChanges.pipe(debounceTime(300)).subscribe(() => {
        params.data.commandeDistribution = this.form.get('commandeDistribution').value;

        // le formulaire a été editer.
        this.params.node.parent.updated = true;

        // on passe le formualre a invalid dans le param. pourlepasser au prant
        this.params.node.parent.formErrors.set('detailsForm', this.form.invalid);
      })
    );

    this.displayErrorsFn = this.displayErrors.bind(this);
    this.params.api.addEventListener('rowDataUpdated', this.displayErrorsFn);

    if (this.isEditing) {
      if (this.params.node.parent.formErrors.has('detailsForm')) {
        this.form.markAllAsTouched();
      } else {
        // Sauvegarde l'invalidité du formulaire sans le node du tableau
        // Cela permet garder l'information même après la destruction de la cellule
        // (destruction causée par une sauvegarde, tri, filtre, changement de page)
        this.params.node.parent.formErrors.set('detailsForm', this.form.invalid);
      }
    }
  }

  refresh(params: any): boolean {
    return false;
  }

  displayErrors() {
    this.form.markAllAsTouched();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.params.api.removeEventListener('cellEditingStarted', this.displayErrorsFn);
  }
}
