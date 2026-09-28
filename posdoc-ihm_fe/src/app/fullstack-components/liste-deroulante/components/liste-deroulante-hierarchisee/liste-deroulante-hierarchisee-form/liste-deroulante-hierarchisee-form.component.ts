import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ListeDeroulanteService } from '../../../services/liste-deroulante.service';
import { Subscription } from 'rxjs';
import { ONE } from '@app/shared/utils/Constants';
import { setChildNodeSelected, setNodeSelected } from '../model/liste-deroulante-hierarchisee.interface';

@Component({
  selector: 'app-liste-deroulante-hierarchisee-form',
  templateUrl: './liste-deroulante-hierarchisee-form.component.html',
  standalone: false,
})
export class ListeDeroulanteHierarchiseeFormComponent implements OnInit, OnDestroy {
  @ViewChild(NgbCollapse) collapse: NgbCollapse;
  @Input() form: FormGroup;
  @Input() key: string;
  @Input() parentIndex: string;
  @Input() isLikeRadioBouton = false;
  @Output() selectedElementOrChildElementsEvent = new EventEmitter<any>();
  isDisabled = false;
  groupForm: FormGroup;
  subscriptions: Subscription[] = [];
  isCollapsed = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly listeDeroulanteService: ListeDeroulanteService
  ) {}

  ngOnInit(): void {
    const isSelectAll = this.listeDeroulanteService.getEtatIsSelectAll(this.form);
    // Formulaire du groupe
    this.groupForm = this.fb.group({
      selectAll: [isSelectAll, null],
    });

    // Met à jour les valeurs lorsque 'Tout sélectionner / Tout désélectionner' est coché
    this.subscriptions.push(
      this.groupForm.valueChanges.subscribe(() => {
        this.listeDeroulanteService.selectAll(this.groupForm, this.form, false);
      })
    );

    // Met à jour la checkbox selectAll du formulaire groupForm lorsque des valeurs sont sélectionnées
    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        this.listeDeroulanteService.shouldSelectAll(this.groupForm, this.form);
      })
    );

    let totalControl = 0,
      nameControl;
    // Annuler la collapse si le formControl n'a pas de children
    for (const prop in this.form.controls) {
      totalControl++;
      nameControl = prop;
    }

    if (totalControl == ONE && this.key.endsWith('null')) {
      this.isDisabled = true;
      this.key = nameControl;
    }
  }

  /**
   * Déplie le groupe partiellement coché, sans quoi ses éléments cochés resteraient masqués.
   * Appelé à chaque ouverture de la liste, l'utilisateur ayant pu replier le groupe entre-temps.
   *
   * Un groupe entièrement coché n'est pas concerné, sa propre case l'indique déjà,
   * ni un groupe sans enfant (isDisabled), qui ne peut pas être partiellement coché.
   */
  expandIfPartiallyChecked(): void {
    if (!this.isCollapsed || this.listeDeroulanteService.getEtatIsSelectAll(this.form) !== null) {
      return;
    }
    // Dépliage immédiat plutôt qu'animé : la liste s'ouvre au même instant et sa position
    // de scroll est calculée juste après, sur une hauteur qui doit déjà être définitive
    this.collapse.animation = false;
    this.collapse.collapsed = false;
    this.collapse.animation = true;
    // Maintient la synchronisation du binding [(ngbCollapse)] et de l'icône +/-
    this.isCollapsed = false;
  }

  sendSelectedElementOrElements(selectedElement: string): void {
    // Émettre que c'est un parent qui a été sélectionné, avec son nom
    this.selectedElementOrChildElementsEvent.emit(setNodeSelected(selectedElement));
  }

  sendSelectedElement(selectedElement: string): void {
    // Émettre que c'est un enfant qui a été sélectionné, avec également la clé du parent
    this.selectedElementOrChildElementsEvent.emit(setChildNodeSelected(selectedElement, this.key));
  }

  resetParentCheckbox(value: boolean): void {
    // Mettre à jour la valeur du groupForm
    this.groupForm.get('selectAll').setValue(value);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
