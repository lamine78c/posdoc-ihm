import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuVertical } from '../../models/menu-vertical.models';
import { MenuVerticalService } from '../../services/menu-vertical.service';

@Component({
  selector: 'app-menu-vertical',
  templateUrl: './menu-vertical.component.html',
  standalone: false,
})
export class MenuVerticalComponent implements OnInit, OnDestroy {
  /**
   * Le menu
   */
  @Input() menuVertical: MenuVertical[] = [];
  /**
   * Affiche le menu toujours ouvert
   * Champ optionnel, valeur par défaut : false
   */
  @Input() alwaysOpened = false;
  /**
   * Largeur du menu déplié
   * Champ optionnel, valeur par défaut : 300
   */
  @Input() menuWidth = 300;

  hoverClass = 'hover';

  allChildrenExcept: number;
  openChildIndex: number;
  subscription: Subscription;

  removeClassCalled: boolean;

  constructor(
    private router: Router,
    private location: Location,
    private menuVerticalService: MenuVerticalService
  ) {}

  ngOnInit(): void {
    // Met à jour la route active dans le menu
    this.setActiveRoute(this.location.path());

    // Met à jour la route active dans le menu à chaque changement de route
    this.subscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.setActiveRoute(e.urlAfterRedirects);
      }
    });
  }

  /**
   * Récupère la route courante pour afficher la route active dans le menu
   */
  setActiveRoute(currentRoute): void {
    this.openChildIndex = this.menuVerticalService.setActiveRoute(currentRoute, this.menuVertical);
  }

  /**
   * Ajoute la classe hover lorsque la souris est sur l'un des menus
   *
   * Explications :
   * Le menu doit uniquement s'ouvrir si l'utilisateur reste sur le même menu 1 seconde
   * Si l'utilisateur déplace sa souris vers un autre menu, le compteur doit repartir de 0
   * L'animation est réalisée un niveau du conteneur parent, mais le déclencheur étant un menu,
   * il est impossible de réaliser uniquement cela en CSS
   *
   * Ici on ajoute et on retire la classe contenant l'animation du conteneur parent à chaque changement de menu
   * Ainsi, le compteur d'animation repart de 0
   */
  addClass(element: HTMLElement): void {
    this.removeClassCalled = false;
    // Si l'élément ne contient pas déjà la classe et que le menu n'est pas en mode toujours ouvert
    if (!this.alwaysOpened && !element.classList.contains(this.hoverClass)) {
      // Si le menu est déjà déplié, ajoute la classe sans timeout pour éviter un début de repliement
      if (element.clientWidth === this.menuWidth) {
        element.classList.add(this.hoverClass);
      } else {
        // Sinon ajoute la classe avec un timeout afin d'avoir un petit délais entre le moment
        // où elle est ajoutée et retirée afin de bien reset de compteur
        setTimeout(() => {
          element.classList.add(this.hoverClass);
          // Avec le timeout, il se peut que la classe ne soit pas mise attend si l'utilisateur passe la souris très rapidement
          // On vérifie donc cela et on enlève la classe
          if (this.removeClassCalled) {
            this.removeClass(element);
          }
        });
      }
    }
  }

  /**
   * Retire la classe hover lorsque le souris sort de l'un des menus
   */
  removeClass(element: HTMLElement): void {
    this.removeClassCalled = true;
    if (!this.alwaysOpened && element.classList.contains(this.hoverClass)) {
      element.classList.remove(this.hoverClass);
    }
  }

  /**
   * Ferme tous les fils sauf celui actuellement ouvert
   */
  closeAllChildrenExcept(allChildrenExcept: number): void {
    this.allChildrenExcept = allChildrenExcept;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
