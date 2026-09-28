import { Component, Input } from '@angular/core';
import { Wizard } from '../../models/wizard.models';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[app-wizard-step]',
  templateUrl: './wizard-step.component.html',
  standalone: false,
})
export class WizardStepComponent {
  /**
   * Numéro de l'étape
   */
  @Input() number: number;
  /**
   * Contenu du wizard
   */
  @Input() wizardStep: Wizard;
  /**
   * Étape active
   */
  @Input() active: number;
  /**
   * Largeur d'une étape en px
   */
  @Input() stepWidth: number;
  /**
   * Si l'étape a déjà été visitée
   */
  @Input() visited: boolean;
}
