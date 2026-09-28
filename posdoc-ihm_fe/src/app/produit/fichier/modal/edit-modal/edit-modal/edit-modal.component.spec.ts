import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormBuilder } from '@angular/forms';
import { PermissionService } from '@app/services/permission/permission.service';
import { CODE_CLIENT_UR_GENERAL } from '@app/shared/utils/Constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditModalComponent } from './edit-modal.component';

describe('EditModalComponent', () => {
  let component: EditModalComponent;
  let fixture: ComponentFixture<EditModalComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let fb: FormBuilder;

  beforeEach(waitForAsync(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close']);

    TestBed.configureTestingModule({
      declarations: [EditModalComponent],
      providers: [FormBuilder, { provide: PermissionService, useValue: mockPermissionService }, { provide: NgbActiveModal, useValue: mockModal }],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockPermissionService.hasPermission.and.returnValue(true);
    fixture = TestBed.createComponent(EditModalComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.formatOptions = [
      {
        value: 'for1',
        text: 'for1',
      },
    ];
    component.typSupportOptions = [
      {
        value: 'tps1',
        text: 'tps1',
      },
    ];
    component.imprimeData = [
      {
        value: 'imp1',
        text: 'imp1',
      },
    ];
    component.clientOptions = ['UR117', 'UR109', 'CIP', 'spcc', 'CNAV'];

    component.allOrgCliSnv2 = [{ codorg: '219', codcli: 'spcc' }];
    component.selectedNodes = [
      {
        data: {
          codeEnv: 'P',
          codeFich: 'Fic',
          codeRegion: '117',
          codeApp: 'SNV2',
          codeOrg: '117',
          codeClient: 'UR117',
          libFichier: 'test',
          codeProd: '',
          refFormat: '',
          typeFormat: 'B',
          refImprime: 'refimp',
          page: 5,
          typeSig: ' ',
          codeDocument: null,
          typeSupport: 'I',
          eclatement: 0,
        },
      },
      {
        data: {
          codeEnv: 'P',
          codeFich: 'Fic',
          codeRegion: '109',
          codeApp: 'SNV2',
          codeOrg: '219',
          codeClient: 'UR109',
          libFichier: 'test',
          codeProd: '',
          refFormat: null,
          typeFormat: 'B',
          refImprime: '',
          page: 5,
          typeSig: ' ',
          codeDocument: null,
          typeSupport: 'I',
          eclatement: 0,
        },
      },
      {
        data: {
          codeEnv: 'P',
          codeFich: 'Fic',
          codeRegion: '',
          codeApp: 'SNV2',
          codeOrg: '110',
          codeClient: 'CIP',
          libFichier: 'test',
          codeProd: '',
          refFormat: null,
          typeFormat: 'B',
          refImprime: '',
          page: 5,
          typeSig: ' ',
          codeDocument: null,
          typeSupport: 'I',
          eclatement: 0,
        },
      },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init formulaire with value', () => {
    component.ngOnInit();
    expect(component.formEditEnMasse.get('designation').value).toEqual(component.selectedNodes[0].data.libFichier);
    expect(component.formEditEnMasse.get('codeProduit').value).toEqual(component.selectedNodes[0].data.codeProd);
    expect(component.formEditEnMasse.get('refFormat').value).toEqual(component.selectedNodes[0].data.refFormat);
    expect(component.formEditEnMasse.get('typeFormat').value).toEqual(component.selectedNodes[0].data.typeFormat);
    expect(component.formEditEnMasse.get('fondPage').value).toEqual(component.selectedNodes[0].data.refImprime);
    expect(component.formEditEnMasse.get('page').value).toEqual(component.selectedNodes[0].data.page);
    expect(component.formEditEnMasse.get('signature').value).toEqual(component.selectedNodes[0].data.typeSig);
    expect(component.formEditEnMasse.get('codeDocument').value).toEqual(component.selectedNodes[0].data.codeDocument);
    expect(component.formEditEnMasse.get('codeDocument').disabled).toBeTruthy();
    expect(component.formEditEnMasse.get('typeSupport').value).toEqual(component.selectedNodes[0].data.typeSupport);
    expect(component.formEditEnMasse.get('eclatement').value).toEqual(component.selectedNodes[0].data.eclatement);

    expect(component.formCodcli.get('codeClient').value).toEqual(CODE_CLIENT_UR_GENERAL);
    expect(component.formOrgCli.get('110').value).toEqual('CIP');
    expect(component.showFormOrgCli).toBeTruthy();
  });

  it('should save the change of code client', () => {
    component.ngOnInit();
    component.editFormDef = false;
    component.editFormCodcli = true;
    component.formOrgCli.get('110').setValue('CNAV');
    component.save();
    expect(mockModal.close).toHaveBeenCalledWith({
      formCodcliData: { codeClient: CODE_CLIENT_UR_GENERAL },
      formOrgCliData: { 110: 'CNAV' },
    });
  });

  it('should save the change of definition', () => {
    component.ngOnInit();
    component.editFormDef = true;
    component.editFormCodcli = false;
    component.formEditEnMasse.get('designation').setValue('designation');
    component.formEditEnMasse.get('typeFormat').setValue('C');
    component.formEditEnMasse.get('typeSupport').setValue('J');
    component.formEditEnMasse.get('fondPage').setValue('refimp - libelle');
    component.save();
    expect(mockModal.close).toHaveBeenCalledWith({
      formDefData: {
        designation: 'designation',
        codeProduit: '',
        refFormat: '',
        typeFormat: 'C',
        fondPage: 'refimp',
        page: 5,
        signature: ' ',
        codeDocument: null,
        typeSupport: 'J',
        eclatement: 0,
      },
    });
  });
});
