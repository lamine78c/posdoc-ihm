import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiAdelaideHabilitationService } from '@app/services/api-adelaide-habilitation.service';

@Injectable({
  providedIn: 'root',
})
export class HabilitationResolver {
  constructor(private habiliattionService: ApiAdelaideHabilitationService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.habiliattionService.getHabilitation();
  }
}
