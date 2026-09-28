import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsComponent } from './details.component';
import { of } from 'rxjs';
import { ApiAdelaideDocumentDematerialiseVideoService } from '@app/services/api-adelaide-docments-dematerialise-video.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms'; // Ajout de ReactiveFormsModule

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;
  let apiService: jasmine.SpyObj<ApiAdelaideDocumentDematerialiseVideoService>;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj('ApiAdelaideDocumentDematerialiseVideoService', ['getDocsDematerialisesVideoInfoDetail']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule], // Ajout du module de formulaire réactif
      declarations: [DetailsComponent],
      providers: [{ provide: ApiAdelaideDocumentDematerialiseVideoService, useValue: apiService }, NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle empty API response gracefully', () => {
    const emptyResponse = { data: { getDocsDematerialisesVideoInfoDetail: null } };
    apiService.getDocsDematerialisesVideoInfoDetail.and.returnValue(of(emptyResponse as any));

    component.paramData = { datdem: '2025-02-13', numdem: '110393' };
    component.ngOnInit();

    expect(apiService.getDocsDematerialisesVideoInfoDetail).toHaveBeenCalledWith(component.paramData);
    expect(component.videoData).toEqual([]);
  });

  it('should get video information detail on init', () => {
    const paramData = { datdem: '2025-02-14', numdem: '110393' };
    const response = {
      data: {
        getDocsDematerialisesVideoInfoDetail: {
          codorg: '117',
          codapp: 'PNR',
          percod: null,
          codenv: 'P',
          codcom: 'ATT0',
          codfic: 'AREFU',
          coddoc: 'AREFU',
          refdem: 'AREFU_2a689923',
          typact: '1',
          imprim: false,
          docsta: 'T',
          docinf: '00',
          ddodeb: '2025-02-14 11:22:03',
          ddofin: '2025-02-14 11:22:03',
          ddosus: null,
          tpscom: '0',
          libinf: '',
          codeSiteDematerialisation: 'CIRTIL',
        },
      },
    };

    component.paramData = paramData;
    apiService.getDocsDematerialisesVideoInfoDetail.and.returnValue(of(response as any));

    component.ngOnInit();

    expect(apiService.getDocsDematerialisesVideoInfoDetail).toHaveBeenCalledWith(paramData);
    expect(component.videoData.length).toBeGreaterThan(0);
    expect(component.modalTitle).toBe('Informations détaillées sur le document dématérialisé 2025-02-14-110393');
  });
});
