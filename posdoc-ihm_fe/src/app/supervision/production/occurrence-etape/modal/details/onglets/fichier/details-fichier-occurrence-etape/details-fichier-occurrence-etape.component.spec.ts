import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsFichierOccurrenceEtapeComponent } from './details-fichier-occurrence-etape.component';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { of } from 'rxjs';
import { VideoStepDetailsFichierModel } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';

describe('DetailsFichierOccurrenceEtapeComponent', () => {
  let component: DetailsFichierOccurrenceEtapeComponent;
  let fixture: ComponentFixture<DetailsFichierOccurrenceEtapeComponent>;
  let apiService: jasmine.SpyObj<ApiGestionOccurrenceEtapeService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiGestionOccurrenceEtapeService', ['getVideoStepDetailsFichier']);

    await TestBed.configureTestingModule({
      declarations: [DetailsFichierOccurrenceEtapeComponent],
      providers: [{ provide: ApiGestionOccurrenceEtapeService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsFichierOccurrenceEtapeComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiGestionOccurrenceEtapeService) as jasmine.SpyObj<ApiGestionOccurrenceEtapeService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get video step details fichier and update videoStepDetailsFichier', () => {
    const mockResponse = {
      data: {
        getVideoStepDetailsFichier: {
          codenv: 'env',
          codorg: 'org',
          codapp: 'app',
          percod: 'period',
          codcom: 'com',
          codfic: 'fic',
          numcom: 'num',
          libfic: 'lib',
          refimp: 'ref',
          codcli: 'cli',
          dfiexp: 'date',
          pagfic: 10,
          plific: 5,
          rejfic: 1,
        },
      },
    };

    component.paramData = {} as VideoStepDetailsFichierModel;

    apiService.getVideoStepDetailsFichier.and.returnValue(of(mockResponse as any));
    component.getVideoStepDetailsFichier();
    expect(component.videoStepDetailsFichier.length).toBe(10);
    expect(component.videoStepDetailsFichier[0]).toEqual(['Application ', 'env-org-app']);
  });
});
