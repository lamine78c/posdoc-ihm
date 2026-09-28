import { Injectable } from '@angular/core';
import { IAppConfigAccueil } from './accueil-config.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AccueilConfigService {
  settings: IAppConfigAccueil;

  constructor(private http: HttpClient) {}

  loadConfiguration() {
    return new Promise((r, e) => {
      // 1 :  Chargement de la conf a distance : (attention au CORS)
      // this.http.get('http://localhost/configuration.json').subscribe((settings: IAppConfig) => {
      // ou 2 :Chargement de la conf dans les assets :
      this.http.get('./assets/configuration/configuration-accueil.json').subscribe(
        (settings: IAppConfigAccueil) => {
          Object.assign(this, settings);
          this.settings = settings;
          r(this);
        },
        (httpErrorResponse: HttpErrorResponse) => {
          console.error('Error retrieving configuration file: ' + httpErrorResponse.message);
          e(httpErrorResponse);
        }
      );
    });
  }
}
