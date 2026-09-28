import { Injectable } from '@angular/core';

export interface Toast {
  body?: string;
  title: string;
  classname: string;
  delay?: number;
  hideClose?: boolean;
  category?: ToastCategoryEnum;
  // A utiliser uniquement pour les note de type INFO
  doNotDisplayCheckbox?: boolean;
  // A utiliser uniquement pour les notes de type ERREUR_DONNEES ou PROCESS
  iconUrl?: string;
  // A utiliser uniquement pour les note de type PROCESS
  link?: string;
  linkText?: string;
}

export interface ToastContainer {
  toast: Toast;
  doNotDisplayAnymore: boolean;
}

// Durée d'affichage des notes de succès (les autres catégories gardent le défaut de 10 s du template)
export const SUCCESS_TOAST_DELAY = 3000;

export enum ToastCategoryEnum {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERREUR_DONNEES = 'ERREUR_DONNEES',
  PROCESS = 'PROCESS',
}

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  toasts: Toast[] = [];
  staticToasts: Toast[] = [];

  /**
   * Ajoute une note dans la liste.
   * Les notes de succès ne s'empilent pas : une nouvelle confirmation remplace la précédente,
   * et se ferme automatiquement après 3 secondes (sauf delay explicite de l'appelant).
   */
  show(toast: Toast): void {
    if (toast.category === ToastCategoryEnum.SUCCESS) {
      this.toasts = this.toasts.filter(t => t.category !== ToastCategoryEnum.SUCCESS);
      toast.delay = toast.delay ?? SUCCESS_TOAST_DELAY;
    }
    this.toasts.push(toast);
  }

  /**
   * Supprime une note de la liste
   */
  remove(toast: Toast): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  /**
   * Ajoute une note dans la liste
   */
  showStatic(toast: Toast): void {
    this.staticToasts.push(toast);
  }

  /**
   * Supprime une note de la liste
   */
  removeStatic(toast: Toast): void {
    this.staticToasts = this.staticToasts.filter(t => t !== toast);
  }

  /**
   * Supprime toutes les notes
   */
  removeAllStatic(): void {
    this.staticToasts = [];
  }
}
