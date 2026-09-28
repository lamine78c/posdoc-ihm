import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuData } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';

import { DetailsEtapeOccurrenceEtapeComponent } from './details-etape-occurrence-etape.component';

describe('DetailsEtapeOccurrenceEtapeComponent', () => {
  let component: DetailsEtapeOccurrenceEtapeComponent;
  let fixture: ComponentFixture<DetailsEtapeOccurrenceEtapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsEtapeOccurrenceEtapeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsEtapeOccurrenceEtapeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the paramData property', () => {
    // Définir la propriété paramData avant d'appeler la méthode
    component.paramData = {
      position: { x: 111, y: 222 },
      statut: 'S',
      etat: 'IDT',
      script: '/test/abc.sh',
      etpfus: '-',
      idtfus: 0,
      clefus: null,
      codapp: 'MAS',
      codcom: 'MAS0',
      coddes: null,
      codenv: 'T',
      codfic: 'M0001',
      codgam: 'MM',
      codinf: 1,
      codorg: '00L',
      codres: null,
      codser: null,
      codsig: 'S05',
      codsit: null,
      create: '2024-10-29T15:19:00',
      debute: null,
      fabsim: true,
      idetap: 3251,
      invali: null,
      nbrexe: 0,
      numcom: '00',
      numexe: null,
      numpid: 0,
      percod: '241023-00',
      reedit: false,
      signal: 't_00l_mas_241023-00_00_mas0_m0001_*',
      stepno: 0,
      suspen: null,
      termin: '2024-11-18T11:31:59',
      valide: '2024-10-29T15:19:00',
    } as MenuData;

    // Appeler getOccurenceEtapeDetails après avoir défini paramData
    component.getOccurenceEtapeDetails();
    // Vérifier que l'ID dans occurenceData
    expect(component.occurenceData[0]).toEqual(['ID', 3251]);
  });
});
