import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  getCurrentEnvironment(): string {
    const fullUrl = window.location.href.toLowerCase();
    const environmentsMap = environment.environmentsMap;

    for (const envKey in environmentsMap) {
      if (fullUrl.includes(envKey.toLowerCase())) {
        return environmentsMap[envKey];
      }
    }

    return '';
  }
}
