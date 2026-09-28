import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-label-valeur',
  templateUrl: './label-valeur.component.html',
  standalone: false,
})
export class LabelValeurComponent implements AfterViewInit {
  @ViewChild('valeurElement') valeurElement: ElementRef;

  /**
   * Label à afficher
   */
  @Input() label: string;
  /**
   * Valeur à afficher
   */
  @Input() valeur: string;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = 4;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 8
   */
  @Input() inputColumns = 8;
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
  @Input() fillInput: boolean = false;

  constructor(private cd: ChangeDetectorRef) {}

  enableTooltip = false;

  ngAfterViewInit(): void {
    this.checkEnableTooltip();
    // Force la détection de changement pour éviter l'erreur : ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkEnableTooltip();
  }

  /**
   * Active un tooltip si le texte est plus grand que la zone dédiée
   */
  checkEnableTooltip(): void {
    const elementOffsetWidth: number = (this.valeurElement.nativeElement as HTMLElement).offsetWidth;
    const elementScrollWidth: number = (this.valeurElement.nativeElement as HTMLElement).scrollWidth;

    if (elementScrollWidth > elementOffsetWidth) {
      this.enableTooltip = true;
    } else {
      this.enableTooltip = false;
    }
  }
}
