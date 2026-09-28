import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from '@app/services/permission/permission.service';
import { BehaviorSubject } from 'rxjs';
import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;

  const mockApi = jasmine.createSpyObj('GridApi', ['addEventListener', 'removeEventListener']);
  const mockParentNode = {
    __objectId: 'test-id',
    updated: false,
    formErrors: new Map(),
  };
  const mockNode = {
    parent: mockParentNode,
  };
  const mockData = {
    codeEnv: 'P',
    codeOrg: '117',
    codeApp: 'PNR',
    codeCom: 'AD04',
    codeFich: 'L00',
    libFichier: 'FICHIER ADELAIDE DES COMPTES PAPIER NON DEMATERIALISES',
    refImprime: 'QDI9A11',
    codeAdr: null,
    codeProd: 'QDI9A',
    refFormat: null,
    typeFormat: 'B',
    page: 99,
    codeClient: 'CIP',
    typeMultif: '-',
    typeSig: ' ',
    typeSupport: 'I',
    codeDocument: null,
    eclatement: 0,
    refSupport: null,
    isNotAuthorisedToBeDeleted: true,
    codeRegion: '117',
    collapse: '',
  };
  const createMockParams = () => ({
    api: mockApi,
    node: mockNode,
    rowIdEdit: 'test-id',
    newRowAdded: false,
    data: mockData,
    client: new BehaviorSubject([{ code: 'c1' }, { code: 'c2' }]),
    format: new BehaviorSubject([
      {
        value: 'fv1',
        text: 'ft1',
      },
      {
        value: 'fv2',
        text: 'ft2',
      },
    ]),
    support: new BehaviorSubject([
      {
        value: 'spv1',
        text: 'spt1',
      },
      {
        value: 'spv2',
        text: 'spt2',
      },
    ]),
    document: new BehaviorSubject(['a', 'r', 'g']),
    imprime: new BehaviorSubject([
      {
        reference: 'ir1',
        libelle: 'il1',
      },
      {
        reference: 'ir2',
        libelle: 'il2',
      },
    ]),
  });
  const mockSignatureOptions = [
    { value: 'R', text: 'RECTO' },
    { value: 'V', text: 'VERSO' },
  ];

  beforeEach(async () => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);

    await TestBed.configureTestingModule({
      declarations: [DetailsComponent],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder, { provide: PermissionService, useValue: mockPermissionService }],
    }).compileComponents();

    mockPermissionService.hasPermission.and.returnValue(true);
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const mockParams = createMockParams();
    component.agInit(mockParams);

    expect(component.form.controls.libFichier).toBeTruthy();
    expect(component.form.controls.codeProd).toBeTruthy();
    expect(component.form.controls.refFormat).toBeTruthy();
    expect(component.form.controls.typeFormat).toBeTruthy();
    expect(component.form.controls.fondPage).toBeTruthy();
    expect(component.form.controls.page).toBeTruthy();
    expect(component.form.controls.codeClient).toBeTruthy();
    expect(component.form.controls.signature).toBeTruthy();
    expect(component.form.controls.codeDocument).toBeTruthy();
    expect(component.form.controls.eclatement).toBeTruthy();
    expect(component.form.controls.refSupport).toBeTruthy();
    expect(component.form.controls.typeSupport).toBeTruthy();
    expect(component.params.api.addEventListener).toHaveBeenCalledWith('rowDataUpdated', component.displayErrorsFn);

    const text = component.getTectByValue('R', mockSignatureOptions);
    expect(text).toEqual('RECTO');

    const result = component.refresh();
    expect(result).toBeFalsy();

    spyOn(component.form, 'markAllAsTouched');
    component.displayErrors();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();

    component.ngOnDestroy();
    expect(component.params.api.removeEventListener).toHaveBeenCalledWith('rowDataUpdated', component.displayErrorsFn);
    expect(component.params.api.removeEventListener).toHaveBeenCalledWith('cellEditingStarted', component.displayErrorsFn);
  });

  it('should detecte form event valueChanges', done => {
    const mockParams = createMockParams();
    component.agInit(mockParams);
    const mockSetFormErrors = spyOn(component.params.node.parent.formErrors, 'set');

    component.form.controls.libFichier.setValue('libFichier');
    component.form.controls.codeProd.setValue('codeProd');
    component.form.controls.refFormat.setValue('refFormat');
    component.form.controls.typeFormat.setValue('A');
    component.form.controls.fondPage.setValue('refimp');
    component.form.controls.page.setValue('10');
    component.form.controls.codeClient.setValue('codeClient');
    component.form.controls.signature.setValue('-');
    component.form.controls.codeDocument.setValue('doc');
    component.form.controls.eclatement.setValue(1);
    component.form.controls.refSupport.setValue('refs');
    component.form.controls.typeSupport.setValue('spt1');

    setTimeout(() => {
      expect(component.params.data.libFichier).toEqual('libFichier');
      expect(component.params.data.codeProd).toEqual('codeProd');
      expect(component.params.data.refFormat).toEqual('refFormat');
      expect(component.params.data.typeFormat).toEqual('A');
      expect(component.params.data.refImprime).toEqual('refimp');
      expect(component.params.data.page).toEqual('10');
      expect(component.params.data.codeClient).toEqual('codeClient');
      expect(component.params.data.typeSig).toEqual('-');
      expect(component.params.data.codeDocument).toEqual('doc');
      expect(component.params.data.eclatement).toEqual(1);
      expect(component.params.data.refSupport).toEqual('refs');
      expect(component.params.data.typeSupport).toEqual('spt1');
      expect(component.params.node.parent.updated).toBeTruthy();
      expect(mockSetFormErrors).toHaveBeenCalledWith('detailsForm', component.form.invalid);
      done();
    }, 400);
  });

  it('getErrorMessage control invalid', done => {
    const mockParams = createMockParams();
    component.agInit(mockParams);
    setTimeout(() => {
      const result = component.getErrorMessage('test');
      expect(result).toBe('');
      done();
    }, 400);
  });

  it('getErrorMessage required invalid', done => {
    const mockParams = createMockParams();
    component.agInit(mockParams);
    component.form.controls.libFichier.setValue('');
    setTimeout(() => {
      const result = component.getErrorMessage('libFichier');
      expect(result).toBe('La valeur ne peut pas être nulle');
      done();
    }, 400);
  });

  it('getErrorMessage pattern invalid', done => {
    const mockParams = createMockParams();
    component.agInit(mockParams);
    component.form.controls.libFichier.setValue('.!§');
    setTimeout(() => {
      const result = component.getErrorMessage('libFichier');
      expect(result).toBe('Caractères autorisés sont : lettres, chiffres, tirets, parenthèses, underscores et espaces');
      done();
    }, 400);
  });
});
