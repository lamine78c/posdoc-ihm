import { Injectable } from '@angular/core';
import { MenuVertical } from '../models/menu-vertical.models';

@Injectable({
  providedIn: 'root',
})
export class MenuVerticalService {
  hadMatch: string;

  /**
   * Récupère la route courante pour afficher la route active dans le menu
   */
  setActiveRoute(currentRoute: string, menuVertical: MenuVertical[]): number {
    let openChildIndex: number;
    this.resetMenu(menuVertical);
    this.hadMatch = null;

    menuVertical.forEach((menu, index: number) => {
      // Cas où il y a un enfant
      if (menu.children?.length > 0) {
        menu.children.forEach(childMenu => {
          if (this.isBestMatch(currentRoute, childMenu.route, menuVertical)) {
            childMenu.activated = true;
            openChildIndex = index;
          }
        });
      } else if (this.isBestMatch(currentRoute, menu.route, menuVertical)) {
        menu.activated = true;
      }
    });

    // Retourne l'index de l'enfant à ouvrir
    return openChildIndex;
  }

  /**
   * Retourne true si la route match et si c'est le meilleur match dans le cas où une autre route match
   */
  isBestMatch(currentRoute: string, menuRoute: string, menuVertical: MenuVertical[]): boolean {
    const alsoMatch = currentRoute.startsWith(menuRoute);
    // Dans le cas où il y avait déjà un match, prendre la route la plus précise
    if (this.hadMatch && alsoMatch) {
      if (this.hadMatch.length < menuRoute.length) {
        this.hadMatch = menuRoute;
        this.resetMenu(menuVertical);
        return true;
      }
    } else if (alsoMatch) {
      // Sinon retourne true si la route match
      this.hadMatch = menuRoute;
      return true;
    }

    return false;
  }

  /**
   * Passe tous les menus dans un état inactif
   */
  resetMenu(menuVertical): void {
    menuVertical.forEach(menu => {
      if (menu.children?.length > 0) {
        menu.children.forEach(childMenu => {
          childMenu.activated = false;
        });
      } else {
        menu.activated = false;
      }
    });
  }
}
