import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiNoticesService } from '@app/services/api-adelaide/supervision/production/details/api-notices.service';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { catchError, map } from 'rxjs/operators';
import { TableauNoticeService } from '@app/produit/notice/service/tableau-notice.service';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(
    private apiNoticesService: ApiNoticesService,
    private notesService: NotesService,
    private tableauNoticeService: TableauNoticeService
  ) {}

  uploadFile(codnot: string): Observable<void> {
    const fileSubject = new Subject<void>();

    this.openFileSelector().subscribe({
      next: file => this.uploadToServer(codnot, file, fileSubject),
      error: error => fileSubject.error(error),
    });

    return fileSubject.asObservable();
  }

  public getPdfFilePath(codnot: string): Observable<string> {
    return this.apiNoticesService.getNoticePdf(codnot).pipe(
      map(response => {
        const byteArray = this.base64ToArrayBuffer((response.data as any).getNoticePdf);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      })
    );
  }

  base64ToArrayBuffer(base64: any): ArrayBuffer | null {
    try {
      if (!this.isValidBase64(base64)) {
        return null;
      }

      const binaryString = atob(base64.trim());
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    } catch (error) {
      console.error('Erreur lors de la conversion Base64 → ArrayBuffer :', error);
      return null;
    }
  }

  deleteNoticePdf(codnot: string): Observable<void> {
    const deleteSubject = new Subject<void>();

    this.apiNoticesService
      .deleteNoticePdf(codnot)
      .pipe(
        catchError(error => {
          this.errorMessage(error);
          deleteSubject.error(error);
          throw error;
        })
      )
      .subscribe(response => {
        this.successMessage('Fichier supprimé avec succès');

        this.tableauNoticeService.notifyNoticesUpdated(response.data.deleteNoticePdf);

        deleteSubject.next();
        deleteSubject.complete();
      });

    return deleteSubject.asObservable();
  }

  private openFileSelector(): Observable<File> {
    return new Observable<File>(observer => {
      const inputFile = document.createElement('input');
      inputFile.type = 'file';
      inputFile.accept = '.pdf';

      inputFile.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (file) {
          observer.next(file);
          observer.complete();
        } else {
          observer.error(new Error('Aucun fichier sélectionné.'));
        }
      };

      inputFile.click();
    });
  }

  private uploadToServer(codnot: string, file: File, observer: Subject<void>): void {
    this.apiNoticesService
      .uploadNoticePdf(codnot, file)
      .pipe(
        catchError(error => {
          this.errorMessage(error);
          observer.error(error);
          throw error;
        })
      )
      .subscribe(response => {
        this.successMessage('Fichier chargé avec succès');
        observer.next();
        observer.complete();

        this.tableauNoticeService.notifyNoticesUpdated(response.data.uploadNoticePdf);
      });
  }

  private successMessage(message: string): void {
    this.notesService.show({
      title: message,
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
  }

  errorMessage(errorMessage: string): void {
    this.notesService.show({
      title: errorMessage ? errorMessage : 'Erreur de chargement du fichier',
      classname: 'note-erreur',
      category: ToastCategoryEnum.ERROR,
    });
  }

  /**
   * Vérifie si une chaîne est un Base64 valide.
   */
  private isValidBase64(base64: any): boolean {
    if (typeof base64 !== 'string') {
      return false;
    }

    const trimmedBase64 = base64.trim();

    return /^[A-Za-z0-9+/=]+$/.test(trimmedBase64);
  }
}
