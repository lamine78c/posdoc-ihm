import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from '@app/services/loaderServeice/loader.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private count = 0;

  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.get('no-spinner') != 'true') {
      if (this.count === 0) {
        this.loaderService.setHttpProgressStatus(true);
      }

      this.count++;
    }
    return next.handle(req).pipe(
      finalize(() => {
        if (req.headers.get('no-spinner') != 'true') {
          this.count--;
          if (this.count === 0) {
            this.loaderService.setHttpProgressStatus(false);
          }
        }
      })
    );
  }
}
