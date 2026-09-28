import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ICellRendererParams } from 'ag-grid-community';
import { PopupFichierCellRendererComponent } from './popup-fichier-cell-renderer.component';

describe('PopupFichierCellRendererComponent', () => {
  let component: PopupFichierCellRendererComponent;
  let fixture: ComponentFixture<PopupFichierCellRendererComponent>;
  let mockModalService: jasmine.SpyObj<NgbModal>;

  beforeEach(waitForAsync(() => {
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    TestBed.configureTestingModule({
      imports: [PopupFichierCellRendererComponent],
      providers: [{ provide: NgbModal, useValue: mockModalService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFichierCellRendererComponent);
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
        codfic: 'd',
        codcom: 'e',
        numcom: 'f',
        percod: 'g',
      },
      node: {
        group: false,
      },
    } as ICellRendererParams;
    component.agInit(params);
    fixture.detectChanges();
    expect(component.value).toEqual(params.value);
    expect(component.params).toEqual(params.data);
  });

  it('should openPopupDetail correctly', () => {
    component.openPopupDetail();
    fixture.detectChanges();
    expect(mockModalService.open).toHaveBeenCalled();
  });
});
