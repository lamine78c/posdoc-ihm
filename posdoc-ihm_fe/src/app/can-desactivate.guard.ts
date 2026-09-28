import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate?: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const canDesactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component: CanComponentDeactivate) =>
  component.canDeactivate ? component.canDeactivate() : true;
