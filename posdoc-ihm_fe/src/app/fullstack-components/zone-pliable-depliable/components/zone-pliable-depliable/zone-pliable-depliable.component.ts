import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-zone-pliable-depliable',
  templateUrl: './zone-pliable-depliable.component.html',
  standalone: false,
})
export class ZonePliableDepliableComponent {
  /**
   * Ouvre la zone pliable par défaut
   * Champ optionnel, valeur par défaut : false
   */
  @Input() openedByDefault: boolean = false;

  /**
   * Envoie un event lorsque le status de l'accordéon change
   */
  @Output() isOpened: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Change de status de l'accordéon
   */
  toggled(): void {
    this.openedByDefault = !this.openedByDefault;
    this.isOpened.emit(this.openedByDefault);
  }
}
