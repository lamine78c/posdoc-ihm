import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Wizard } from '../../models/wizard.models';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  standalone: false,
})
export class WizardComponent implements OnChanges, AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer: ElementRef;

  /**
   * Contenu du wizard
   */
  @Input() wizard: Wizard[];
  /**
   * Étape active
   */
  @Input() active;
  /**
   * Largeur d'une étape en px
   * Champ optionnel, valeur par défaut : 250
   */
  @Input() stepWidth = 250;
  /**
   * Affiche tout le temps les icônes de navigation
   * Sinon, les icônes s'affichent automatiquement lorsque nécessaire
   * Champ optionnel, valeur par défaut : false
   */
  @Input() alwaysDisplayNavigation: boolean = false;
  /**
   * Vitesse de navigation dans les onglets
   * Champ optionnel, valeur par défaut : 150
   */
  @Input() navScroll = 150;
  /**
   * Étape cliquée
   */
  @Output() stepClicked = new EventEmitter<number>();

  visited: number[] = [];

  nativeElement: HTMLElement;
  maxScrollLeft: number;

  disableLeftNavigation = false;
  disableRightNavigation = false;

  constructor(private cd: ChangeDetectorRef) {}

  /**
   * Garde en mémoire les différentes étapes déjà visitées
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.active && this.active) {
      this.visited.push(this.active);
    }
  }

  /**
   * Envoie un message au container parent lorsqu'une étape cliquable est cliquée
   */
  onStepClicked(step: number, wizardStep: Wizard): void {
    if (!wizardStep.disableClick && (this.visited.indexOf(step) !== -1 || step < this.active)) {
      this.stepClicked.emit(step);
    }
  }

  /**
   * Une fois la vue chargée, récupère l'élément scrollable et vérifie l'état des boutons
   */
  ngAfterViewInit(): void {
    this.setNativeElement();
    this.checkLimits();

    // Force le changement de détection pour bien mettre à jour les éléments de la UI
    this.cd.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setNativeElement();
    this.checkLimits();
  }

  /**
   * Récupère l'élément scrollable après le chargement
   */
  setNativeElement(): void {
    this.nativeElement = this.scrollContainer.nativeElement as HTMLElement;
    this.maxScrollLeft = this.nativeElement.scrollWidth - this.nativeElement.clientWidth - 1;
  }

  /**
   * Scroll à gauche si possible et vérifie le status des icônes de navigation
   */
  scrollLeft(): void {
    if (this.nativeElement.scrollLeft > 0) {
      const currentScroll = this.nativeElement.scrollLeft;
      this.nativeElement.scroll({ left: currentScroll - this.navScroll });
      this.checkLimits();
    }
  }

  /**
   * Scroll à droite si possible et vérifie le status des icônes de navigation
   */
  scrollRight(): void {
    if (this.nativeElement.scrollLeft < this.maxScrollLeft) {
      const currentScroll = this.nativeElement.scrollLeft;
      this.nativeElement.scroll({ left: currentScroll + this.navScroll });
      this.checkLimits();
    }
  }

  /**
   * Vérifie le statut des icônes de navigation
   */
  checkLimits(): void {
    this.disableLeftNavigation = false;
    this.disableRightNavigation = false;

    if (this.nativeElement.scrollLeft >= this.maxScrollLeft) {
      this.disableRightNavigation = true;
    }

    if (this.nativeElement.scrollLeft === 0) {
      this.disableLeftNavigation = true;
    }
  }
}
