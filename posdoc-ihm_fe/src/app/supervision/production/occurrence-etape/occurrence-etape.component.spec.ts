import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { OccurrenceEtapeComponent } from './occurrence-etape.component';
import { OccurrenceEtapeStepType } from '@app/models/enums/occurrence-etape-step-type';
import { VideoStep } from '@app/models/supervision/video-step-interface';

@Component({ selector: 'app-dag-network', template: '', standalone: true })
class DagNetworkStubComponent {
  @Input() networkData: any;
  @Input() statutListForBtns: any;
  @Input() realTimeConsultation: boolean;
  @Output() networkRightClick = new EventEmitter();
  @Output() networkDoubleClick = new EventEmitter();
  @Output() realTimeConsultationChange = new EventEmitter();
  networkRendered = of(Date.now());
}

@Component({ selector: 'app-search-occurrence-etape', template: '', standalone: true })
class SearchStubComponent {
  @Output() applySearchEvent = new EventEmitter<any>();
}

@Component({ selector: 'app-occurrence-etape-menu', template: '', standalone: true })
class MenuStubComponent {
  @Input() menuData: any;
  @Output() applySearchEvent = new EventEmitter<void>();
}

class MockApiGestionOccurrenceEtapeService {
  private iterations: Array<{ firstStep: VideoStep; steps: VideoStep[] }> = [];
  private cursor = 0;

  constructor() {
    this.iterations = [
      {
        firstStep: this.buildStep(1, null, OccurrenceEtapeStepType.DEB, 'C'),
        steps: [],
      },
      {
        firstStep: this.buildStep(1, null, OccurrenceEtapeStepType.DEB, 'C'),
        steps: [
          this.buildStep(2, 1, OccurrenceEtapeStepType.IDT, 'D'),
          this.buildStep(3, 2, OccurrenceEtapeStepType.FAB, 'V'),
          this.buildStep(4, 3, OccurrenceEtapeStepType.FIN, 'T'),
        ],
      },
      {
        firstStep: this.buildStep(1, null, OccurrenceEtapeStepType.DEB, 'C'),
        steps: [
          this.buildStep(2, 1, OccurrenceEtapeStepType.IDT, 'T'),
          this.buildStep(3, 2, OccurrenceEtapeStepType.FAB, 'S'),
          this.buildStep(4, 3, OccurrenceEtapeStepType.FIN, 'T'),
          this.buildStep(5, 3, OccurrenceEtapeStepType.DIS, 'V'),
        ],
      },
      {
        firstStep: this.buildStep(1, null, OccurrenceEtapeStepType.DEB, 'C'),
        steps: [
          this.buildStep(2, 1, OccurrenceEtapeStepType.IDT, 'I'),
          this.buildStep(3, 2, OccurrenceEtapeStepType.FAB, 'V'),
          this.buildStep(4, 3, OccurrenceEtapeStepType.FIN, 'T'),
          this.buildStep(5, 3, OccurrenceEtapeStepType.DIS, 'S'),
        ],
      },
    ];
  }

  getFirstVideoStep(): any {
    const iteration = this.iterations[this.cursor];
    return of({ data: { getFirstVideoStep: iteration.firstStep } });
  }

  getVideoSteps(): any {
    const iteration = this.iterations[this.cursor];
    // advance cursor after pairing with getFirstVideoStep
    this.cursor = Math.min(this.cursor + 1, this.iterations.length - 1);
    return of({ data: { getVideoSteps: iteration.steps } });
  }

  private buildStep(idetap: number, idpere: number | null, typetp: OccurrenceEtapeStepType, statut: string): VideoStep {
    return {
      idetap,
      idpere,
      typetp,
      statut,
      codinf: '',
      codcom: '',
      codfic: '',
      codgam: '',
      codsit: '',
      codres: '',
      reedit: 0,
      numpid: '',
      clefus: '',
      numcom: '',
      codser: '',
      coddes: '',
      etpfus: '',
      idtfus: '',
      codenv: '',
      codorg: '',
      codapp: '',
      percod: '',
      stepno: '',
      create: '',
      valide: '',
      debute: '',
      termin: '',
      invali: '',
      suspen: '',
      numexe: '',
      nbrexe: '',
      codsig: '',
      signal: '',
      fabsim: '',
      codenvapp: '',
      numordre: 0,
      reeditbool: false,
      script: '',
    } as unknown as VideoStep;
  }
}

const baseEvent = {
  environnement: 'env',
  organisme: 'org',
  application: 'app',
  periode: 'per',
  commande: 'com',
  gamme: 'gam',
  reedit: '0',
  etpfus: '0',
  statut: 'C',
};

const runLister = async (component: OccurrenceEtapeComponent, times: number) => {
  for (let i = 0; i < times; i++) {
    await component.lister(baseEvent);
  }
};

const mainNodesOnly = (nodes: any[]) => nodes.filter(n => n.widthConstraint !== false && typeof n.widthConstraint !== 'undefined');

describe('OccurrenceEtapeComponent rendering iterations', () => {
  let component: OccurrenceEtapeComponent;
  let fixture: ComponentFixture<OccurrenceEtapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DagNetworkStubComponent, SearchStubComponent, MenuStubComponent],
      declarations: [OccurrenceEtapeComponent],
      providers: [{ provide: ApiGestionOccurrenceEtapeService, useClass: MockApiGestionOccurrenceEtapeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceEtapeComponent);
    component = fixture.componentInstance;

    let seed = 1000;
    spyOn(component, 'generateRandomNodeId').and.callFake(() => ++seed);

    fixture.detectChanges();
  });

  it('gère une première itération sans enfants en produisant un graphe vide', async () => {
    await runLister(component, 1);
    expect(component.nodes.length).toBe(0);
    expect(component.edges.length).toBe(0);
  });

  it('construit les nœuds/arrêtes attendus à la deuxième itération', async () => {
    await runLister(component, 2); // vide puis structure IDT/FAB/FIN

    expect(component.nodes.length).toBe(7); // 4 steps + 3 nœuds techniques générés
    expect(component.edges.length).toBe(6); // 2 arêtes par étape

    expect(mainNodesOnly(component.nodes).map(n => n.id)).toEqual([1, 2, 3, 4]);
  });

  it('rafraîchit correctement sur plusieurs récupérations successives', async () => {
    await runLister(component, 1);
    expect(component.nodes.length).toBe(0);

    await runLister(component, 1);
    expect(component.nodes.length).toBe(7);
    expect(component.edges.length).toBe(6);

    await runLister(component, 1);
    expect(component.nodes.length).toBe(9);
    expect(component.edges.length).toBe(8);
  });

  it('met à jour le statut/label et ajoute DIS sur itération suivante', async () => {
    await runLister(component, 3); // arrive jusqu’à l’itération 3

    expect(component.nodes.length).toBe(9); // 5 steps + 4 nœuds techniques
    expect(component.edges.length).toBe(8);

    const mainNodes = component.nodes.filter(n => [1, 2, 3, 4, 5].includes(n.id as number));
    expect(mainNodes.length).toBe(5);
    const statutById = new Map(mainNodes.map(n => [n.id, (n.label as string).match(/\((.)/)?.[1] || '']));

    expect(statutById.get(2)).toBe('T');
    expect(statutById.get(3)).toBe('S');
    expect(statutById.get(5)).toBe('V');
  });

  it('effectue un soft update (même structure) sans déplacer les nœuds', async () => {
    await runLister(component, 3);
    const positionsBefore = new Map<number, { x: number; y: number }>(
      component.nodes.map(n => [n.id as number, { x: n.x ?? 0, y: n.y ?? 0 }]) as [number, { x: number; y: number }][]
    );

    await runLister(component, 1); // itération 4

    const mainNodes = component.nodes.filter(n => [1, 2, 3, 4, 5].includes(n.id as number));
    const statutById = new Map(mainNodes.map(n => [n.id, (n.label as string).match(/\((.)/)?.[1] || '']));

    mainNodes.forEach(n => {
      const before = positionsBefore.get(n.id as number);
      expect(before).toBeDefined();
      if (before) {
        expect(n.x).toBe(before.x);
        expect(n.y).toBe(before.y);
      }
    });

    expect(statutById.get(2)).toBe('I');
    expect(statutById.get(3)).toBe('V');
    expect(statutById.get(5)).toBe('S');
  });
});
