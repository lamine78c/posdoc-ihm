import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReleaseNoteInterface {
  version: string;
  date: string;
  features?: string[];
  fixes?: string[];
}

@Injectable({ providedIn: 'root' })
export class ReleaseNotesService {
  private readonly http = inject(HttpClient);
  constructor() {
    // no-op
  }

  getReleaseNotes(): Observable<ReleaseNoteInterface[]> {
    return this.http.get<ReleaseNoteInterface[]>('assets/datasets/release-notes.json');
  }
}
