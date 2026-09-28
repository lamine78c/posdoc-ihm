import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiInterceptor } from './api-interceptor';

describe('ApiInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let interceptor: ApiInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ApiInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    interceptor = TestBed.inject(ApiInterceptor);

    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  describe('Non /api/v1 requests', () => {
    it('should not add headers for non /api/v1 URLs', () => {
      sessionStorage.setItem('user.organismes', '001,002');
      sessionStorage.setItem('user.login', 'test.user');

      httpClient.get('/other/endpoint').subscribe();

      const req = httpMock.expectOne('/other/endpoint');
      expect(req.request.headers.has('user.organismes')).toBe(false);
      expect(req.request.headers.has('user.login')).toBe(false);

      req.flush({});
    });

    it('should pass through requests without modification when URL does not include /api/v1', () => {
      httpClient.post('/graphql', { query: 'test' }).subscribe();

      const req = httpMock.expectOne('/graphql');
      expect(req.request.url).toBe('/graphql');
      expect(req.request.body).toEqual({ query: 'test' });

      req.flush({ data: 'response' });
    });
  });

  describe('/api/v1 requests with user.organismes', () => {
    it('should add user.organismes header when present in sessionStorage', () => {
      sessionStorage.setItem('user.organismes', '001,002,003');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.organismes')).toBe('001,002,003');

      req.flush({});
    });

    it('should not add user.organismes header when not in sessionStorage', () => {
      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.has('user.organismes')).toBe(false);

      req.flush({});
    });

    it('should add ,999 to user.organismes for AsyncAPIsForParametreEdition operationName', () => {
      sessionStorage.setItem('user.organismes', '001,002');

      httpClient.post('/api/v1/graphql', { operationName: 'AsyncAPIsForParametreEdition' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.organismes')).toBe('001,002,999');

      req.flush({});
    });

    it('should add ,999 to user.organismes for updateMasseExemplaires operationName', () => {
      sessionStorage.setItem('user.organismes', '001,002');

      httpClient.post('/api/v1/graphql', { operationName: 'updateMasseExemplaires' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.organismes')).toBe('001,002,999');

      req.flush({});
    });

    it('should add ,999 to user.organismes for updateExemplaire operationName', () => {
      sessionStorage.setItem('user.organismes', '001,002');

      httpClient.post('/api/v1/graphql', { operationName: 'updateExemplaire' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.organismes')).toBe('001,002,999');

      req.flush({});
    });

    it('should not add ,999 for other operationNames', () => {
      sessionStorage.setItem('user.organismes', '001,002');

      httpClient.post('/api/v1/graphql', { operationName: 'someOtherOperation' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.organismes')).toBe('001,002');

      req.flush({});
    });

    it('should not add ,999 when user.organismes is not in sessionStorage', () => {
      httpClient.post('/api/v1/graphql', { operationName: 'AsyncAPIsForParametreEdition' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.has('user.organismes')).toBe(false);

      req.flush({});
    });
  });

  describe('/api/v1 requests with user.login', () => {
    it('should add user.login header when present in sessionStorage', () => {
      sessionStorage.setItem('user.login', 'john.doe');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.login')).toBe('john.doe');

      req.flush({});
    });

    it('should not add user.login header when not in sessionStorage', () => {
      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.has('user.login')).toBe(false);

      req.flush({});
    });
  });

  describe('/api/v1 requests with both headers', () => {
    it('should add both user.organismes and user.login headers when present', () => {
      sessionStorage.setItem('user.organismes', '001,002');
      sessionStorage.setItem('user.login', 'jane.smith');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.organismes')).toBe('001,002');
      expect(req.request.headers.get('user.login')).toBe('jane.smith');

      req.flush({});
    });

    it('should add both headers with ,999 for special operations', () => {
      sessionStorage.setItem('user.organismes', '001');
      sessionStorage.setItem('user.login', 'admin.user');

      httpClient.post('/api/v1/graphql', { operationName: 'updateMasseExemplaires' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.get('user.organismes')).toBe('001,999');
      expect(req.request.headers.get('user.login')).toBe('admin.user');

      req.flush({});
    });
  });

  describe('Error handling', () => {
    it('should log error when request fails', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');
      const errorStatus = 500;

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe({
        next: () => fail('should have failed'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(errorStatus);
          expect(consoleErrorSpy).toHaveBeenCalledWith(`Erreur lors de l'envoi de la requête, code = ${errorStatus}`);
          done();
        }
      });

      const req = httpMock.expectOne('/api/v1/graphql');
      req.flush('Server error', { status: errorStatus, statusText: 'Internal Server Error' });
    });

    it('should log error with correct status code for 404', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe({
        next: () => fail('should have failed'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de l\'envoi de la requête, code = 404');
          done();
        }
      });

      const req = httpMock.expectOne('/api/v1/graphql');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should still return the error observable after logging', (done) => {
      spyOn(console, 'error');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe({
        next: () => fail('should have failed'),
        error: (error: HttpErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toBe(403);
          done();
        }
      });

      const req = httpMock.expectOne('/api/v1/graphql');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Request cloning', () => {
    it('should clone the request', () => {
      sessionStorage.setItem('user.organismes', '001');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');

      // The request should have the added header
      expect(req.request.headers.get('user.organismes')).toBe('001');

      // The original request body should still be intact
      expect(req.request.body).toEqual({ operationName: 'testQuery' });

      req.flush({});
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string for user.organismes', () => {
      sessionStorage.setItem('user.organismes', '');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.has('user.organismes')).toBe(false);

      req.flush({});
    });

    it('should handle empty string for user.login', () => {
      sessionStorage.setItem('user.login', '');

      httpClient.post('/api/v1/graphql', { operationName: 'testQuery' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      expect(req.request.headers.has('user.login')).toBe(false);

      req.flush({});
    });

    it('should handle request body without operationName', () => {
      sessionStorage.setItem('user.organismes', '001');

      httpClient.post('/api/v1/graphql', { query: 'test' }).subscribe();

      const req = httpMock.expectOne('/api/v1/graphql');
      // Should still add the header but without ,999 since operationName is undefined
      expect(req.request.headers.get('user.organismes')).toBe('001');

      req.flush({});
    });
  });
});
