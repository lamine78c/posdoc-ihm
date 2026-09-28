import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Arborescence, ArborescenceOutputEvent } from '../../models/aborescence.models';
import { ArborescenceService } from '../../services/arborescence.service';

@Component({
  selector: 'app-arborescence-children',
  templateUrl: './arborescence-children.component.html',
  standalone: false,
})
export class ArborescenceChildrenComponent implements OnInit, OnDestroy {
  /**
   * Arbre à afficher et ses enfants
   */
  @Input() tree: Arborescence[];
  /**
   * Index des parents au format x-x-x, x étant une valeur numérique
   */
  @Input() parentsIndexes: string;
  /**
   * Formulaire du parent (si il existe)
   */
  @Input() parentForm: FormGroup;
  /**
   * Affiche des checkboxes
   */
  @Input() useCheckboxes: boolean;

  /**
   * Output pour envoyer un événement aux parents
   */
  @Output() output: EventEmitter<ArborescenceOutputEvent> = new EventEmitter<ArborescenceOutputEvent>();

  formGroup: FormGroup;
  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private arborescenceService: ArborescenceService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({});

    // Construit son formulaire en fonction de son arbre
    this.tree
      .sort((a, b) => a.ordre - b.ordre)
      .forEach((tree: Arborescence, index: number) => {
        // Utilise comme clef dans le formulaire l'index de l'arbre
        this.formGroup.addControl('' + index, new FormControl(tree.value));
      });

    // Dans le cas où il y a un parent
    if (this.parentForm) {
      // Écoute les changements du parent
      this.subscriptions.push(
        this.parentForm.valueChanges.subscribe(changes => {
          // Met à jour les enfants en fonction du changement parent
          this.tree.forEach((tree: Arborescence, index: number) => {
            // Met à jour le formulaire, cette mise à jour va trigger this.formGroup.valueChanges
            if (this.formGroup.get('' + index).getRawValue() != changes) this.formGroup.patchValue({ ['' + index]: changes });
            //this.formGroup.setValue({[''+index]: changes}, {emitEvent: false, onlySelf: true});

            // Update tree
            // tree.value = changes;
          });
        })
      );

      for (const field in this.formGroup.controls) {
        // 'field' is a string
        this.subscriptions.push(
          this.formGroup.get(field).valueChanges.subscribe(change => {
            this.tree[field].value = change;
            const value = this.arborescenceService.getValueForm(this.tree);

            // Informe le composant parent qu'il y a eu des modifications
            // parentsIndexes permet de retrouver quel checkbox doit être mise à jour dans les parents
            this.output.emit({ value: value, parentsIndexes: this.parentsIndexes });
          })
        ); // 'control' is a FormControl
      }

      // // Écoute les changements sur le formulaire
      // this.subscriptions.push(this.formGroup.valueChanges.subscribe((changes) => {
      //   // Met à jour l'arbre avec les changements du formulaire
      //   this.tree.forEach((tree: Arborescence, index: number) => {
      //     // Récupère le bon index dans le changement
      //    //tree.value = changes[index];
      //   });

      //   // Récupère la valeur à transmettre au parent
      //   const value = this.arborescenceService.getValueForm(this.tree);

      //   // Informe le composant parent qu'il y a eu des modifications
      //   // parentsIndexes permet de retrouver quel checkbox doit être mise à jour dans les parents
      //   this.output.emit({value: value, parentsIndexes: this.parentsIndexes});
      // }));
    }
  }

  /**
   * Événement envoyé par le composant enfant pour informer les parents de façon successives d'un changement
   */
  outputFn(event: ArborescenceOutputEvent): void {
    if (event?.parentsIndexes) {
      let indexToUpdate;
      if (this.parentForm) {
        // Récupère la longueur d'indexation du parent
        const nb = this.parentsIndexes.split('-').length; // Exemple : 1-2 => 2
        // Récupère dans l'event, l'index à modifier (Exemple : 1-2-1 => 1)
        indexToUpdate = event.parentsIndexes.split('-')[nb];
      } else {
        // Dans le cas d'un parent premier niveau
        // Récupère directement l'index, c'est la première valeur (1-2-1 => 1)
        indexToUpdate = event.parentsIndexes.split('-')[0];
      }

      // Met à jour l'arbre avec les changements du formulaire
      //this.tree[indexToUpdate].value = event.value;
      // Met à jour le formulaire avec la valeur de l'évènement
      let t = this.formGroup.get(indexToUpdate).getRawValue();
      if (this.formGroup.get(indexToUpdate).getRawValue() != event.value)
        this.formGroup.get(indexToUpdate).setValue(event.value, { emitEvent: false, onlySelf: true });
      // Met à jour l'arbre avec les changements du formulaire
      //this.tree[indexToUpdate].value = event.value;
    }

    // Si il y a un formulaire parent
    if (this.parentForm) {
      // Récupère la valeur à transmettre au prochain parent
      const value = this.arborescenceService.getValueForm(this.tree);

      // Transmet l'évènement au parent avec la bonne valeur dans son cas
      this.output.emit({ ...event, value: value });
    } else {
      // Sinon trigger quand même le output afin de récupérer l'information d'un changement dans le tree view
      this.output.emit(null);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
