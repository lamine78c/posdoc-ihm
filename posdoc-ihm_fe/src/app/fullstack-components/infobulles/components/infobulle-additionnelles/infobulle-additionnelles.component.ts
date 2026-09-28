import { Component, Input } from '@angular/core';
import { PlacementArray } from '@ng-bootstrap/ng-bootstrap/util/positioning';

@Component({
  selector: 'app-infobulle-additionnelles',
  templateUrl: './infobulle-additionnelles.component.html',
  standalone: false,
})
export class InfobulleAdditionnellesComponent {
  /**
   * Paramètre optionnel.
   * Documentation officielle :
   *
   * The preferred placement of the popover.
   *
   * Possible values are "top", "top-start", "top-left", "top-end", "top-right", "bottom",
   * "bottom-start", "bottom-left", "bottom-end", "bottom-right", "start", "left", "start-top",
   * "left-top", "start-bottom", "left-bottom", "end", "right", "end-top", "right-top", "end-bottom", "right-bottom"
   *
   * Accepts an array of strings or a string with space separated possible values.
   *
   * The default order of preference is `"auto"` (same as the sequence above).
   *
   * Please see the [positioning overview](#/positioning) for more details.
   */
  @Input() placement: PlacementArray;
  /**
   * Affiche le tire dans la popover.
   * Paramètre optionnel.
   * Valeur par défaut : false
   */
  @Input() displayTitle = false;
  /**
   * Taille de l'icône ouvrant la popover en px
   * Paramètre optionnel.
   * Valeur par défaut : 20
   */
  @Input() iconSize = 20;
}
