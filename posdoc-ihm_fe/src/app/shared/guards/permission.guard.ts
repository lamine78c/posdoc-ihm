import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { PermissionService } from '@app/services/permission/permission.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard {
  constructor(
    protected router: Router,
    protected permissionService: PermissionService
  ) {}

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.permissionService.hasPermission(route.data.perm) ? true : this.router.parseUrl('home');
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.permissionService.hasPermission(route.data.perm) ? true : this.router.parseUrl('home');
  }
}
