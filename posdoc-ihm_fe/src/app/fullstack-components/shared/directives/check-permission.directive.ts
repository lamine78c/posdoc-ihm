import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '@app/services/permission/permission.service';

@Directive({
  selector: '[appCheckPermission]',
  standalone: false,
})
export class CheckPermissionDirective implements OnInit, OnDestroy {
  @Input() appCheckPermission: number;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private vcr: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    if (this.permissionService.hasPermission(this.appCheckPermission)) {
      this.vcr.createEmbeddedView(this.templateRef);
    } else {
      this.vcr.clear();
    }
  }

  ngOnDestroy(): void {
    this.vcr.clear();
  }
}
