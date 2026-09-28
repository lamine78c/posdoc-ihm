import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ICellRendererParams } from 'ag-grid-community';
import { PopupPeriodeCellRendererComponent } from './popup-periode-cell-renderer.component';

describe('PopupPeriodeCellRendererComponent', () => {
  let component: PopupPeriodeCellRendererComponent;
  let fixture: ComponentFixture<PopupPeriodeCellRendererComponent>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  beforeEach(waitForAsync(() => {
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    TestBed.configureTestingModule({
      imports: [PopupPeriodeCellRendererComponent],
      providers: [{ provide: NgbModal, useValue: mockModalService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupPeriodeCellRendererComponent);
    component = fixture.componentInstance;
    mockModalService.open.and.returnValue({ componentInstance: {} } as NgbModalRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should agInit correctly', () => {
    const params = {
      value: 'v',
      data: {
        codenv: 'a',
        codorg: 'b',
        codapp: 'c',
        percod: 'g',
      },
    } as ICellRendererParams;
    component.agInit(params);
    fixture.detectChanges();
    expect(component.value).toEqual(params.value);
    expect(component.paramData).toEqual({
      codEnv: 'a',
      codOrg: 'b',
      codApp: 'c',
      perCod: 'g',
    });
  });

  it('should openPopupDetail correctly', () => {
    component.openPopupDetail();
    fixture.detectChanges();
    expect(mockModalService.open).toHaveBeenCalled();
  });
});
