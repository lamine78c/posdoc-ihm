import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-bouton',
  templateUrl: './report-bouton.component.html',
  styleUrls: ['./report-bouton.component.scss'],
  standalone: false,
})
export class ReportBoutonComponent {
  public href_actuelle = '';
  public href_redmine = 'https://redmine.altair.recouv/projects/devintrafront/issues/new?issue[subject]=';

  constructor(private router: Router) {}

  report(): void {
    this.href_actuelle = this.router.url;
    window.open(this.href_redmine + 'Anomalie sur la page ' + this.href_actuelle);
  }
}
