import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { ApiAdelaideAdresseRetourService } from '@app/services/api-adelaide-adresse-retour.service';
import { ApiAdelaideFichierService } from '@app/services/api-adelaide-fichier.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { ModalAddAdresseFichierComponent } from './modal-add-adresse-fichier.component';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { TableauConfigurationBuilderService } from '@app/fullstack-components/tableau/services/tableau-configuration-builder.service';
import { TableauModalFichierAdresseRetourService } from '../../service/tableau-modal-fichier-adresse-retour.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH, KEY_MODIFIER_AUTH } from '@app/services/permission/PermissionsFile';
import { GridApi, GridReadyEvent, IRowNode } from 'ag-grid-community';

describe('ModalAddAdresseFichierComponent', () => {
  let component: ModalAddAdresseFichierComponent;
  let fixture: ComponentFixture<ModalAddAdresseFichierComponent>;
  let mockApiFichierService: jasmine.SpyObj<ApiAdelaideFichierService>;
  let mockApiAdresseRetourService: jasmine.SpyObj<ApiAdelaideAdresseRetourService>;
  let mockTableauConfigurationBuilderService: jasmine.SpyObj<TableauConfigurationBuilderService>;
  let mockTableauModalFichierAdresseRetourService: jasmine.SpyObj<TableauModalFichierAdresseRetourService>;
  let mockNoteService: jasmine.SpyObj<NotesService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockGridApi: jasmine.SpyObj<GridApi>;
  let mockModal: jasmine.SpyObj<NgbActiveModal>;
  let fb: FormBuilder;
  const mockResponseData = [
    {
      codeEnv: 'I',
      codeApp: 'SNV2',
      codeCom: 'ADEH',
      codeFich: 'L00',
      codeProd: 'AD16A',
      refImprime: 'AD16A03',
      libFichier: 'Appels de cotisations trimestriel                                               ',
      codeOrg: '116',
      codeAdr: null,
      refFormat: null,
      typeFormat: 'B',
      page: 5,
      codeClient: null,
      typeMultif: '-',
      typeSupport: 'S',
      typeSig: '',
      refSupport: null,
      eclatement: 0,
      codeDocument: null,
    },
    {
      codeEnv: 'I',
      codeApp: 'MAS',
      codeCom: 'ED29',
      codeFich: 'L02',
      codeProd: 'PD24B',
      refImprime: 'PD24A09',
      libFichier: 'TABLEAUX RECAPITULATIFS ACT                                                     ',
      codeOrg: '116',
      codeAdr: null,
      refFormat: null,
      typeFormat: 'B',
      page: 5,
      codeClient: null,
      typeMultif: '-',
      typeSupport: 'I',
      typeSig: '',
      refSupport: null,
      eclatement: 0,
      codeDocument: null,
    },
    {
      codeEnv: 'I',
      codeApp: 'MAS',
      codeCom: 'ED28',
      codeFich: 'L00',
      codeProd: 'PD24B',
      refImprime: '',
      libFichier: 'TABLEAUX RECAPITULATIFS ACT                                                     ',
      codeOrg: '116',
      codeAdr: null,
      refFormat: null,
      typeFormat: 'B',
      page: 5,
      codeClient: null,
      typeMultif: '-',
      typeSupport: 'I',
      typeSig: '',
      refSupport: null,
      eclatement: 0,
      codeDocument: null,
    },
    {
      codeEnv: 'I',
      codeApp: 'MAS',
      codeCom: 'ED28',
      codeFich: 'L01',
      codeProd: '',
      refImprime: 'PD24A09',
      libFichier: 'TABLEAUX RECAPITULATIFS ACT                                                     ',
      codeOrg: '116',
      codeAdr: null,
      refFormat: null,
      typeFormat: 'B',
      page: 5,
      codeClient: null,
      typeMultif: '-',
      typeSupport: 'I',
      typeSig: '',
      refSupport: null,
      eclatement: 0,
      codeDocument: null,
    },
    {
      codeEnv: 'P',
      codeApp: 'PNR',
      codeCom: 'ED29',
      codeFich: 'L00',
      codeProd: 'PD24A',
      refImprime: 'PD24A09',
      libFichier: 'TABLEAUX RECAPITULATIFS RG                                                      ',
      codeOrg: '116',
      codeAdr: null,
      refFormat: null,
      typeFormat: 'B',
      page: 5,
      codeClient: null,
      typeMultif: '-',
      typeSupport: 'I',
      typeSig: '',
      refSupport: null,
      eclatement: 0,
      codeDocument: null,
    },
  ];
  const mockResponse = { data: { getFichiersForAdsNull: mockResponseData }, loading: false, networkStatus: 7 };
  const mockResponseUpdateData = [
    {
      codeEnv: 'P',
      codeApp: 'PNR',
      codeCom: 'ED29',
      codeFich: 'L00',
      codeProd: 'PD24A',
      refImprime: 'PD24A09',
      libFichier: 'TABLEAUX RECAPITULATIFS RG                                                      ',
      codeOrg: '116',
      codeAdr: null,
      refFormat: null,
      typeFormat: 'B',
      page: 5,
      codeClient: null,
      typeMultif: '-',
      typeSupport: 'I',
      typeSig: '',
      refSupport: null,
      eclatement: 0,
      codeDocument: null,
    },
  ];
  const mockResponseUpdate = { data: { updateFichiersFromAdressesRetour: mockResponseUpdateData }, loading: false, networkStatus: 7 };

  beforeEach(waitForAsync(() => {
    mockApiFichierService = jasmine.createSpyObj('ApiAdelaideFichierService', ['getFichiersForAdsNull']);
    mockApiAdresseRetourService = jasmine.createSpyObj('ApiAdelaideAdresseRetourService', ['updateFichiersFromAdressesRetour']);
    mockTableauModalFichierAdresseRetourService = jasmine.createSpyObj('TableauModalFichierAdresseRetourService', [
      'getColumnDefs',
      'getOverlayNoRowsTemplate',
    ]);
    mockTableauConfigurationBuilderService = jasmine.createSpyObj('TableauConfigurationBuilderService', ['createGridConfiguration']);
    mockNoteService = jasmine.createSpyObj('NotesService', ['show']);
    mockModal = jasmine.createSpyObj('NgbActiveModal', ['close']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission', 'hasActionDeMasse']);
    mockGridApi = jasmine.createSpyObj('GridApi', ['redrawRows', 'setGridOption', 'getSelectedNodes']);

    TestBed.configureTestingModule({
      declarations: [ModalAddAdresseFichierComponent],
      providers: [
        FormBuilder,
        { provide: TableauConfigurationBuilderService, useValue: mockTableauConfigurationBuilderService },
        { provide: TableauModalFichierAdresseRetourService, useValue: mockTableauModalFichierAdresseRetourService },
        { provide: ApiAdelaideFichierService, useValue: mockApiFichierService },
        { provide: ApiAdelaideAdresseRetourService, useValue: mockApiAdresseRetourService },
        { provide: NotesService, useValue: mockNoteService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: NgbActiveModal, useValue: mockModal },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockPermissionService.hasPermission.and.returnValue(true);
    mockApiFichierService.getFichiersForAdsNull.and.returnValue(of(mockResponse));
    mockApiAdresseRetourService.updateFichiersFromAdressesRetour.and.returnValue(of(mockResponseUpdate));
    mockTableauConfigurationBuilderService.createGridConfiguration.and.returnValue({});
    mockTableauModalFichierAdresseRetourService.getColumnDefs.and.returnValue([]);
    mockTableauModalFichierAdresseRetourService.getOverlayNoRowsTemplate.and.returnValue('Aucun résultat');
    mockGridApi.getSelectedNodes.and.returnValue([{ data: { index: 1 } }, { data: { index: 2 } }] as IRowNode[]);

    fixture = TestBed.createComponent(ModalAddAdresseFichierComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.activeModal = mockModal;
    component.adresseSelected = '75_TSA1';
    component.orgSelected = '116';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit validity', () => {
    spyOn(component, 'getFichiersForAdsNull');
    spyOn(component, 'initForm');
    spyOn(component, 'initGrid');
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getFichiersForAdsNull).toHaveBeenCalled();
    expect(component.initForm).toHaveBeenCalled();
    expect(component.initGrid).toHaveBeenCalled();
    expect(component.canEditPermPosition).toEqual(AUTH.FICHIER_EDITION.ADRESSES_RETOUR[KEY_MODIFIER_AUTH]);
  });

  it('getFichiersForAdsNull validity', () => {
    component.getFichiersForAdsNull();
    fixture.detectChanges();

    expect(mockApiFichierService.getFichiersForAdsNull).toHaveBeenCalledWith(
      component.envirionnementSelected,
      component.orgSelected,
      component.applicationSelected,
      component.commandeSelected,
      component.fichierSelected,
      component.refImpSelected
    );
    expect(component.fichiers).toEqual(mockResponseData);
    expect(component.environnementsList).toEqual([
      { value: 'I', text: 'I' },
      { value: 'P', text: 'P' },
    ]);
  });

  it('initForm validity', () => {
    component.initForm();
    fixture.detectChanges();

    expect(component.formGroup).toBeDefined();
    expect(component.formGroup.controls.environnement).toBeTruthy();
    expect(component.formGroup.controls.environnement.value).toEqual(null);
    expect(component.formGroup.controls.application).toBeTruthy();
    expect(component.formGroup.controls.application.value).toEqual(null);
    expect(component.formGroup.controls.commande).toBeTruthy();
    expect(component.formGroup.controls.commande.value).toEqual(null);
    expect(component.formGroup.controls.fichier).toBeTruthy();
    expect(component.formGroup.controls.fichier.value).toEqual(null);
    expect(component.formGroup.controls.refImp).toBeTruthy();
    expect(component.formGroup.controls.refImp.value).toEqual('%');
  });

  it('initGrid validity', () => {
    component.initGrid();
    fixture.detectChanges();

    expect(mockTableauConfigurationBuilderService.createGridConfiguration).toHaveBeenCalledWith(true);
    expect(component.gridOptions.floatingFiltersHeight).toBe(0);
    expect(mockTableauModalFichierAdresseRetourService.getColumnDefs).toHaveBeenCalled();
    expect(component.columnDefs).toEqual([]);
    expect(mockTableauModalFichierAdresseRetourService.getOverlayNoRowsTemplate).toHaveBeenCalled();
    expect(component.overlayNoRowsTemplate).toEqual('Aucun résultat');
  });

  it('onGridReady validity', () => {
    const mockGridReadyEvent = {
      api: mockGridApi,
      type: 'gridReady',
      context: {},
    } as unknown as GridReadyEvent<any, any>;

    component.onGridReady(mockGridReadyEvent);
    fixture.detectChanges();

    expect(component.gridApi).toEqual(mockGridApi);
    expect(component.gridColumnApi).toEqual(mockGridApi);
    expect(component.params).toEqual(mockGridReadyEvent);
  });

  it('onChangeEnvironnement validity', () => {
    component.fichiers = mockResponseData;
    component.onChangeEnvironnement('I');
    fixture.detectChanges();

    expect(component.envirionnementSelected).toEqual('I');
    expect(component.applicationsList).toEqual([
      { value: 'MAS', text: 'MAS' },
      { value: 'SNV2', text: 'SNV2' },
    ]);

    component.onChangeEnvironnement('');
    expect(component.envirionnementSelected).toEqual(null);
  });

  it('onChangeApplication validity', () => {
    component.fichiers = mockResponseData;
    component.envirionnementSelected = 'I';
    component.onChangeApplication('MAS');
    fixture.detectChanges();

    expect(component.applicationSelected).toEqual('MAS');
    expect(component.commandesList).toEqual([
      { value: 'ED28', text: 'ED28' },
      { value: 'ED29', text: 'ED29' },
    ]);

    component.onChangeApplication('');
    expect(component.applicationSelected).toEqual(null);
  });

  it('onChangeCommande validity', () => {
    component.fichiers = mockResponseData;
    component.envirionnementSelected = 'I';
    component.applicationSelected = 'MAS';
    component.onChangeCommande('ED28');
    fixture.detectChanges();

    expect(component.commandeSelected).toEqual('ED28');
    expect(component.fichiersList).toEqual([
      { value: 'L00', text: 'L00 - PD24B' },
      { value: 'L01', text: 'L01 - PD24A09' },
    ]);

    component.onChangeCommande('');
    expect(component.commandeSelected).toEqual(null);
  });

  it('onChangeFichier validity', () => {
    component.onChangeFichier('L00');
    fixture.detectChanges();

    expect(component.fichierSelected).toEqual('L00');

    component.onChangeFichier(null);
    expect(component.fichierSelected).toEqual(null);
  });

  it('setRefImpSelected validity', () => {
    component.formGroup.controls.refImp.setValue('');
    component.setRefImpSelected();
    fixture.detectChanges();

    expect(component.refImpSelected).toEqual(null);

    component.formGroup.controls.refImp.setValue('re_f%');
    component.setRefImpSelected();
    expect(component.refImpSelected).toEqual('re.f.*');
  });

  it('lister validity', () => {
    component.fichiers = mockResponseData;
    component.gridApi = mockGridApi;
    component.lister();
    fixture.detectChanges();

    expect(mockGridApi.redrawRows).toHaveBeenCalled();
    expect(component.nombreTotalArticles).toBe(5);

    component.envirionnementSelected = 'I';
    component.lister();
    expect(component.nombreTotalArticles).toBe(4);

    component.applicationSelected = 'MAS';
    component.lister();
    expect(component.nombreTotalArticles).toBe(3);

    component.commandeSelected = 'ED28';
    component.lister();
    expect(component.nombreTotalArticles).toBe(2);

    component.formGroup.controls.refImp.setValue('PD24A09');
    component.fichierSelected = 'L01';
    component.lister();
    expect(component.nombreTotalArticles).toBe(1);
  });

  it('passBack validity', () => {
    spyOn(component.passEntry, 'emit');
    component.gridApi = mockGridApi;
    component.passBack();
    fixture.detectChanges();

    expect(mockApiAdresseRetourService.updateFichiersFromAdressesRetour).toHaveBeenCalledWith([
      { index: 1, codeAdr: '75_TSA1', codeOrg: '116' },
      { index: 2, codeAdr: '75_TSA1', codeOrg: '116' },
    ]);
    expect(mockNoteService.show).toHaveBeenCalledWith({
      title: "L'adresse retour a été mise à jour avec succès",
      classname: 'note-confirmation',
      category: ToastCategoryEnum.SUCCESS,
    });
    expect(component.passEntry.emit).toHaveBeenCalledWith(1);
    expect(component.activeModal.close).toHaveBeenCalled();

    const mockError = { graphQLErrors: [{ message: 'error' }] };
    mockApiAdresseRetourService.updateFichiersFromAdressesRetour.and.returnValue(throwError(mockError));
    component.passBack();
    expect(component.errorPass).toEqual('error');
  });

  it('isEnableButton validity', () => {
    component.gridApi = mockGridApi;
    const result = component.isEnableButton();
    fixture.detectChanges();

    expect(result).toBeTruthy();
  });
});
