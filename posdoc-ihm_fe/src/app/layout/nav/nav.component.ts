import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { date, version } from '../../../../package.json';
import { ApiAdelaideVersionService } from '@app/services/api-adelaide-version-service';
import { ReleaseNoteInterface, ReleaseNotesService } from '@app/services/release-notes.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PopupComponent } from '@app/fullstack-components/popup/components/popup/popup.component';
import { VersionService } from '@app/layout/nav/service/version.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: false,
})
export class NavComponent implements OnInit {
  version = version;
  date = date;
  versionBack = null;
  versionAdelaide = null;
  @ViewChild('releaseNotesTemplate') releaseNotesTemplate: TemplateRef<any>;
  notes: ReleaseNoteInterface[] = [];

  private readonly router = inject(Router);
  private readonly apiAdelaideVersionService = inject(ApiAdelaideVersionService);
  private readonly releaseNotesService = inject(ReleaseNotesService);
  private readonly modalService = inject(NgbModal);
  private readonly versionService = inject(VersionService);

  constructor() {
    //no-op
  }

  isPanelOpen(panelRoute: string): boolean {
    return this.router.url.startsWith(panelRoute);
  }

  AUTH = AUTH;
  ngOnInit(): void {
    if (this.versionBack == null) {
      this.versionService.getVersion().subscribe(data => {
        this.versionBack = (data as any).data.getVersion;
      });
    }
    if (this.versionAdelaide == null) {
      this.versionService.getVersionAdelaide().subscribe(data => {
        this.versionAdelaide = (data as any).data.getVersionAdelaide;
      });
    }
  }

  openReleaseNotesPopup(): void {
    this.releaseNotesService.getReleaseNotes().subscribe((notes: ReleaseNoteInterface[]) => {
      this.notes = this.processReleaseNotes(notes);
      this.openModal();
    });
  }

  private processReleaseNotes(notes: ReleaseNoteInterface[]): ReleaseNoteInterface[] {
    return notes.map(note => this.mapNoteWithDefaults(note)).sort((a, b) => this.sortByDate(a, b));
  }

  private mapNoteWithDefaults(note: ReleaseNoteInterface): ReleaseNoteInterface {
    return {
      ...note,
      version: note.version ?? this.getDefaultValue(this.version),
      date: note.date ?? this.getDefaultValue(this.date),
    };
  }

  private getDefaultValue(value: string): string | null {
    return value !== 'empty' ? value : null;
  }

  private sortByDate(a: ReleaseNoteInterface, b: ReleaseNoteInterface): number {
    if (!a.date && !b.date) return 0;
    if (!a.date) return -1;
    if (!b.date) return 1;
    return b.date.localeCompare(a.date);
  }

  private openModal(): void {
    const modalRef: NgbModalRef = this.modalService.open(PopupComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    this.configureModal(modalRef);
  }

  private configureModal(modalRef: NgbModalRef): void {
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.componentInstance.title = 'Suivi';
    modalRef.componentInstance.firstButton = { label: 'Fermer', icone: 'icon-b_cancel' };
    modalRef.componentInstance.secondButton = null;
    modalRef.componentInstance.isFormValid = true;
    modalRef.componentInstance.isShowcontentTemplate = true;
    modalRef.componentInstance.contentTemplate = this.releaseNotesTemplate;
  }
}
