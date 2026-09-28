import { AfterViewInit, ChangeDetectorRef, ElementRef, Input, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-interrupteur-litteral',
  templateUrl: './interrupteur-litteral.component.html',
  standalone: false,
})
export class InterrupteurLitteralComponent implements AfterViewInit {
  constructor(private cd: ChangeDetectorRef) {}

  @ViewChild('element1') element1: ElementRef;
  @ViewChild('element2') element2: ElementRef;
  @ViewChild('elementBg') elementBg: ElementRef;

  @Input() switchLabel1: string;
  @Input() switchLabel2: string;
  @Input() label: string;
  @Input() form: FormControl;

  element1Width: number;
  element2Width: number;
  selectedElementWidth: number;
  firstElementSelected = true;

  ngAfterViewInit(): void {
    // Récupère la taille des différents éléments nécessaire à l'animation
    this.element1Width = (this.element1.nativeElement as HTMLElement).offsetWidth;
    this.element2Width = (this.element2.nativeElement as HTMLElement).offsetWidth;

    // Sélectionne le bon élément en fonction du formulaire
    if (this.form.value === this.switchLabel2) {
      this.selectedElementWidth = this.element2Width;
      this.firstElementSelected = !this.firstElementSelected;
    } else {
      this.selectedElementWidth = this.element1Width;
      // Pour le cas où la valeur n'est pas initialisée
      this.form.setValue(this.switchLabel1);
    }

    // Force la détection de changement pour mettre à jour la UI
    this.cd.detectChanges();

    // Ajoute les class de transition après un délais pour éviter un effet de transition à l'initialisation
    setTimeout(() => {
      (this.elementBg.nativeElement as HTMLElement).classList.add('switch-bg-transi');
      (this.element1.nativeElement as HTMLElement).classList.add('switch-color-transi');
      (this.element2.nativeElement as HTMLElement).classList.add('switch-color-transi');
    });
  }

  /**
   * Évite le scroll de la page via la touche espace lorsque l'utilisateur l'utilise sur le switch
   */
  keypress(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }

  /**
   * Change l'élément sélectionné
   */
  toggle(): void {
    if (this.firstElementSelected) {
      this.selectedElementWidth = this.element2Width;
      this.form.setValue(this.switchLabel2);
    } else {
      this.selectedElementWidth = this.element1Width;
      this.form.setValue(this.switchLabel1);
    }

    this.firstElementSelected = !this.firstElementSelected;
  }
}
