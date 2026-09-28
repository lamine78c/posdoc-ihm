import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mire-attente',
  templateUrl: './mire-attente.component.html',
  standalone: false,
})
export class MireAttenteComponent {
  /**
   * Texte afficher à droite de la mire d'attente
   */
  @Input() text: string;

  /**
   * Agrandit la mire d'attente pour un format plein écran
   */
  @Input() fullScreen = false;
}
