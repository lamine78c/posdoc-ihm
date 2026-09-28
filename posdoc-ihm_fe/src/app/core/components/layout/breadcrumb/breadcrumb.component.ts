import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: false,
})
export class BreadcrumbComponent implements OnInit {
  static readonly ROUTE_DATA_BREADCRUMB = 'breadcrumb';

  breadcrumbs: Breadcrumb[] = [{ label: 'test', url: '/test' }];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      if (route.snapshot.fragment != null) {
        const label = route.snapshot.fragment;
        const url = '#' + label;
        breadcrumbs.push({ label, url });
      }
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data[BreadcrumbComponent.ROUTE_DATA_BREADCRUMB];
      if (label != null) {
        breadcrumbs.push({ label, url });
      }

      //Search other part of the URL
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
  }
}
