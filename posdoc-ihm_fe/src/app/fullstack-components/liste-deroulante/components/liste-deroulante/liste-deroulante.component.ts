import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StringUtil } from '@app/shared/utils/StringUtil';

@Component({
  selector: 'app-liste-deroulante',
  templateUrl: './liste-deroulante.component.html',
  styleUrls: ['./liste-deroulante.component.scss'],
  standalone: false,
})
export class ListeDeroulanteComponent implements OnInit, AfterViewInit {
  @ViewChild('sel', { static: false })
  selectRef!: ElementRef<HTMLSelectElement>;

  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() index: string;
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormControl;
  /**
   * Liste des possibilités à afficher dans la liste
   */
  @Input() options: { value: string; text: string; actif?: boolean }[];
  /**
   * Affiche le message "Loading..." pour informer que les options sont en cours de chargement.
   */
  @Input() isLoadingOptions: boolean;
  /**
   * Affiche un valeur blanche dans la liste des propositions
   * Champ optionnel, peut être laissé à vide pour ne pas afficher de valeur blanche
   */
  @Input() hasBlankOption: boolean;
  /**
   * Affiche '%' comme valeur blanche par défaut dans la liste des propositions
   */
  @Input() blankOptionValue: string = '%';
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
  /**
   * Les éléments du sélecteur seront colorés en vert ou en rouge selon l'état de l'attribut 'actif'
   * Champ optionnel, peut être laissé à vide pour un sélecteur sans couleurs
   */
  @Input() isOptionsWithActifAttribute: boolean;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = 4;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = 6;
  /**
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;
  /**
   * L'input prendra toute la place
   * Ne prend plus en compte la largeur des colonnes
   * Utilise la valeur labelWidth
   * Champ optionnel, faux par défaut
   */
  //@Input() errorMessage: string;
  /**
   * Le traitement souhaité en cas de selectionner un item
   */
  @Output() changeEvent = new EventEmitter<string>();
  /**
   * l'input rempli tout l'espace disponible
   */
  @Input() fillInput: boolean = false;
  /**
   * Affiche un ou plusieurs messages d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string | { message: string }[];
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical: boolean = false;

  array = Array;

  @Input() isDisabled: boolean = false;

  @Input() labelClass = '';
  @Input() size = null;

  ngOnInit(): void {
    // générer un formIndex unique s'il manque
    if (!this.index) {
      this.index = StringUtil.uniqueKey();
    }
  }

  ngAfterViewInit() {
    if (this.size) {
      setTimeout(() => {
        const select = this.selectRef?.nativeElement;
        if (!select) {
          return;
        }
        // récupérer l'option sélectionnée
        const selectedIndex = select.selectedIndex;
        const selectedOption = select.options[selectedIndex];
        // centrer l'option sélectionnée
        selectedOption?.scrollIntoView({
          block: 'center',
        });
      });
    }
  }

  onChange(): void {
    this.changeEvent.emit(this.form.value);
  }

  isColoredOptionsTemplate(option: { value: string; text: string; actif?: boolean }) {
    if (this.isOptionsWithActifAttribute) {
      return option.actif ? 'rgb(204, 255, 204)' : 'rgb(255, 153, 153)';
    }
    return '';
  }
}
