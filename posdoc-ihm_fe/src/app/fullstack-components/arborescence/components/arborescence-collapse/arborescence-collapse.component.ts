import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Arborescence, ArborescenceOutputEvent } from '../../models/aborescence.models';

@Component({
  selector: 'app-arborescence-collapse',
  templateUrl: './arborescence-collapse.component.html',
  styleUrls: ['./arborescence-collapse.component.scss'],
  standalone: false,
})
export class ArborescenceCollapseComponent implements OnInit {
  /**
   * Composant intermédiaire permettant de gérer correctement le collapsing
   */

  /**
   * Arbre à afficher et ses enfants
   */
  @Input() tree: Arborescence[];
  /**
   * Index des parents au format x-x-x, x étant une valeur numérique
   */
  @Input() parentsIndexes: string;
  /**
   * Index actuellement affiché
   */
  @Input() index: number;
  /**
   * Formulaire affiché
   */
  @Input() formGroup: FormGroup;
  /**
   * Affiche des checkboxes
   */
  @Input() useCheckboxes: boolean;

  /**
   * Output pour envoyer un événement aux parents
   */
  @Output() output: EventEmitter<ArborescenceOutputEvent> = new EventEmitter<ArborescenceOutputEvent>();

  /**
   * Output pour envoyer le click sur l'item (habilitation)
   */
  @Output() itemClick: EventEmitter<Object> = new EventEmitter<Object>();

  isCollapsed: boolean = false;

  static idItemSelected: number = 0;

  public classReference = ArborescenceCollapseComponent;

  constructor(
    private cdRef: ChangeDetectorRef,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.isCollapsed = !this.tree[this.index].expandChildByDefault;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  /**
   * Transmet simplement l'événement au parent
   */
  outputFn(event: ArborescenceOutputEvent): void {
    this.output.emit(event);
  }

  /**
   * transmet l'evenement au parent lors du clique sur le boutton h'una habiliatation
   * @param event
   */
  itemClicked(vent) {
    ArborescenceCollapseComponent.idItemSelected = vent.id;
    const domEvent = new CustomEvent('habilitationClicked', { bubbles: true, detail: vent });
    this.el.nativeElement.dispatchEvent(domEvent);
  }

  /**
   * transmet l'evenement au parent lors du clique sur la checkbox
   * @param event
   */
  checkboxClicked(index) {
    let vent = this.tree[index];
    vent.value = this.formGroup['controls'][index].value;
    const domEvent = new CustomEvent('habilitationSelected', { bubbles: true, detail: vent });
    this.el.nativeElement.dispatchEvent(domEvent);
  }
}
