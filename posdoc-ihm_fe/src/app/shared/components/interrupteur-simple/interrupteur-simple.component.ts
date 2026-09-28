import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-interrupteur-simple',
  templateUrl: './interrupteur-simple.component.html',
  styleUrls: ['./interrupteur-simple.component.scss'],
  standalone: false,
})
export class InterrupteurSimpleComponent implements OnInit {
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormControl;
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() formIndex: number;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() labelColumns = 6;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = 6;
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
  /**
   * Affiche un ou plusieurs messages d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string | { message: string }[];

  array = Array;

  constructor() {
    // do nothing
  }

  ngOnInit(): void {
    // do nothing
  }
}
