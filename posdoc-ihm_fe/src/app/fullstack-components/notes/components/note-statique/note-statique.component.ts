import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastCategoryEnum, NotesService, ToastContainer } from '../../services/notes.service';

@Component({
  selector: 'app-note-statique',
  templateUrl: './note-statique.component.html',
  standalone: false,
})
export class NoteStatiqueComponent {
  /**
   * Catégorie de la note à afficher
   */
  @Input() category: ToastCategoryEnum;
  // eslint-disable-next-line
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public notesService: NotesService) {}

  /**
   * Ferme la note
   * Et renvoie l'information au container parent concernant l'affichage de la note
   */
  closeToast(toastContainer: ToastContainer): void {
    this.notesService.removeStatic(toastContainer.toast);
    this.close.emit(toastContainer.doNotDisplayAnymore);
  }
}
