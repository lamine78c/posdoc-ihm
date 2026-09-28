import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Data, Edge, Node, Position } from 'vis-network';
import { Observable, Subscription, Subject, of, firstValueFrom, race, timer } from 'rxjs';
import { ApiGestionOccurrenceEtapeService } from '@app/services/api-adelaide/supervision/production/api-gestion-occurrence-etape.service';
import { VideoStep, VideoStepInput } from '@app/models/supervision/video-step-interface';
import { switchMap, take, mapTo, takeUntil } from 'rxjs/operators';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { IdType } from 'vis-timeline';
import { HistoryOfPosition, MenuData, StatutForBtn } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { DetailsModalOccurrenceEtapeComponent } from '@app/supervision/production/occurrence-etape/modal/details/details-modal-occurrence-etape.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OccurrenceEtapeStepType } from '@app/models/enums/occurrence-etape-step-type';
import { DagNetworkComponent } from './dag-network/dag-network.component';

@Component({
  selector: 'app-occurrence-etape',
  templateUrl: './occurrence-etape.component.html',
  standalone: false,
})
export class OccurrenceEtapeComponent implements OnDestroy {
  searchEvent: any;
  networkData: Observable<Data>;
  yMap = new Map<number, number>();
  nodes: Node[];
  edges: Edge[];
  statutListForBtns: StatutForBtn[];
  historyOfIDTPositions: HistoryOfPosition[];
  historyOfFABPositions: HistoryOfPosition[];
  historyOfDISPositions: HistoryOfPosition[];
  menuData: MenuData;
  dataForMenu: VideoStep[];
  interval: any;
  realTimeConsultation = false;
  videoSteps: VideoStep[];
  private lastSignature?: string;
  private cachedNodes?: Node[];
  private cachedEdges?: Edge[];
  private cachedStatutListForBtns?: StatutForBtn[];
  private cachedDataForMenu?: VideoStep[];
  private listerSub?: Subscription;
  private readonly destroy$ = new Subject<void>();

  @ViewChild(DagNetworkComponent) dagNetwork?: DagNetworkComponent;

  constructor(
    private apiGestionOccurrenceEtapeService: ApiGestionOccurrenceEtapeService,
    private modalService: NgbModal
  ) {}

  getDataFromStep(stepId: IdType, position: Position): MenuData {
    const data = this.dataForMenu.find(e => e.idetap === stepId);
    return {
      position: position,
      statut: data.statut,
      etat: data.typetp,
      script: data.script,
      idetap: data.idetap,
      numcom: data.numcom,
      codcom: data.codcom,
      codfic: data.codfic,
      codgam: data.codgam,
      codinf: data.codinf,
      codser: data.codser,
      codsit: data.codsit,
      codres: data.codres,
      coddes: data.coddes,
      reedit: data.reedit,
      etpfus: data.etpfus,
      idtfus: data.idtfus,
      codenv: data.codenv,
      codorg: data.codorg,
      codapp: data.codapp,
      percod: data.percod,
      stepno: data.stepno,
      numpid: data.numpid,
      clefus: data.clefus,
      create: data.create,
      valide: data.valide,
      debute: data.debute,
      termin: data.termin,
      invali: data.invali,
      suspen: data.suspen,
      numexe: data.numexe,
      nbrexe: data.nbrexe,
      codsig: data.codsig,
      signal: data.signal,
      fabsim: data.fabsim,
    };
  }

  getMoreInformations(event: { id: IdType; position: Position }): void {
    const modalRef = this.modalService.open(DetailsModalOccurrenceEtapeComponent);
    modalRef.componentInstance.menuData = this.getDataFromStep(event.id, event.position);
  }

  networkRightClick(event: { id: IdType; position: Position }): void {
    this.menuData = this.getDataFromStep(event.id, event.position);
  }

  drawNetwork(): void {
    this.networkData = of({ nodes: this.nodes, edges: this.edges });
  }

  getVideoStepInput(event): VideoStepInput {
    return {
      codenv: event.environnement,
      codorg: event.organisme,
      codapp: event.application,
      percod: event.periode,
      codcom: event.commande,
      codgam: event.gamme,
      reedit: event.reedit,
      etpfus: event.etpfus,
      statut: event.statut,
    };
  }

  init(): void {
    this.nodes = [];
    this.edges = [];
    this.statutListForBtns = [];
    this.dataForMenu = [];
    this.historyOfIDTPositions = [{ id: null, y: 0, numberOfChild: 1 }];
    this.historyOfFABPositions = [{ id: null, y: 0, numberOfChild: 1 }];
    this.historyOfDISPositions = [{ id: null, y: 0, numberOfChild: 1 }];
  }

  getNodeColor(statut: string): any {
    const colorMap: { [key: string]: string } = {
      C: 'rgb(255,255,255)',
      V: 'rgb(150,200,180)',
      D: 'rgb(190,210,230)',
      I: 'rgb(255,255,130)',
      T: 'rgb(255,170,130)',
      S: 'rgb(240,180,190)',
      H: 'rgb(170,150,130)',
    };
    return {
      border: 'rgb(0, 0, 0)',
      background: colorMap[statut],
    };
  }

  setFirstNode(firstVideoStep: VideoStep): void {
    this.init();
    const ROOT_POSITION = 0;
    this.statutListForBtns.push({
      id: firstVideoStep.idetap,
      idParent: firstVideoStep.idpere,
      statut: firstVideoStep.statut,
    });
    this.dataForMenu.push(firstVideoStep);
    this.yMap.set(firstVideoStep.idetap, ROOT_POSITION);
    this.nodes.push({
      id: firstVideoStep.idetap,
      label: this.getLabel(firstVideoStep),
      title: this.getTooltip(firstVideoStep),
      borderWidth: 2,
      widthConstraint: 100,
      color: this.getNodeColor(firstVideoStep.statut),
      x: this.getPositionX(firstVideoStep),
      y: this.getPositionY(firstVideoStep),
    });
  }

  applySearch(): void {
    // relance la recherche avec l'event lancé
    this.lister(this.searchEvent);
  }

  private buildSignature(steps: VideoStep[]): string {
    return [...steps]
      .sort((a, b) => Number(a.idetap) - Number(b.idetap))
      .map(step =>
        [
          step.idetap,
          step.idpere,
          step.typetp,
          step.statut,
          step.reedit,
          step.codcom,
          step.codfic,
          step.codgam,
          step.codsit,
          step.codres,
          step.codinf,
        ].join('|')
      )
      .join(';');
  }

  lister(event): Promise<void> {
    this.searchEvent = event;
    this.listerSub?.unsubscribe();
    return new Promise<void>((resolve) => {
      const finishAfterRender = () => resolve();
      let firstStep: VideoStep | null = null;

      this.listerSub = this.apiGestionOccurrenceEtapeService
        .getFirstVideoStep(this.getVideoStepInput(event))
        .pipe(
          switchMap(firstResult => {
            firstStep = firstResult.data.getFirstVideoStep;
            return this.apiGestionOccurrenceEtapeService.getVideoSteps(this.getVideoStepInput(event));
          })
        )
        .subscribe({
          next: result => {
            if (!firstStep) {
              this.drawNetwork();
              this.waitForRender().then(finishAfterRender);
              return;
            }
            this.videoSteps = result.data.getVideoSteps;
            const signature = this.buildSignature([firstStep, ...this.videoSteps]);
            if (signature === this.lastSignature && this.cachedNodes && this.cachedEdges && this.cachedStatutListForBtns && this.cachedDataForMenu) {
              this.nodes = [...this.cachedNodes];
              this.edges = [...this.cachedEdges];
              this.statutListForBtns = [...this.cachedStatutListForBtns];
              this.dataForMenu = [...this.cachedDataForMenu];
              finishAfterRender();
              return;
            }

            this.setFirstNode(firstStep);
            const DISSteps = this.videoSteps.filter((e: VideoStep) => e.typetp === OccurrenceEtapeStepType.DIS.toString());

            // Si on a que le nœud parent on ne doit pas l'afficher seul
            if (!this.videoSteps.length) {
              this.nodes.shift();
              this.lastSignature = signature;
              this.cachedNodes = [...this.nodes];
              this.cachedEdges = [];
              this.cachedStatutListForBtns = [];
              this.cachedDataForMenu = [...this.dataForMenu];
              this.drawNetwork();
              this.waitForRender().then(finishAfterRender);
              return;
            }

            this.videoSteps
              .filter((step: VideoStep) => step.typetp !== OccurrenceEtapeStepType.DIS.toString())
              .sort((a, b) => this.sortHelperForPositionY(a, b))
              .forEach((e: VideoStep) => {
                this.nodes.push(this.videoStepToNode(e));
                if (e.typetp === OccurrenceEtapeStepType.FAB.toString()) {
                  this.setDISSteps(e, DISSteps);
                }
              });

            const tempNodes = [...SharedUtil.getUniqueList(this.nodes, 'id')];
            this.nodes = tempNodes.sort((a: Node, b: Node) => a.x - b.x);

            this.statutListForBtns.push(
              ...result.data.getVideoSteps
                .sort((a, b) => this.sortHelperForBtns(a, b))
                .map((e: VideoStep) => ({ id: e.idetap, idParent: e.idpere, statut: e.statut }))
            );

            this.dataForMenu.push(...SharedUtil.getUniqueList(result.data.getVideoSteps, 'idetap').map((e: VideoStep) => e));
            this.setLinks(result.data.getVideoSteps);
            this.drawNetwork();

            this.lastSignature = signature;
            this.cachedNodes = [...this.nodes];
            this.cachedEdges = [...this.edges];
            this.cachedStatutListForBtns = [...this.statutListForBtns];
            this.cachedDataForMenu = [...this.dataForMenu];

            this.waitForRender().then(finishAfterRender);
          },
          error: () => {
            this.drawNetwork();
            this.waitForRender().then(finishAfterRender);
          }
        });
    });
  }

  /**
   * Returns a promise that resolves when the child network component emits
   * the `networkRendered` event or after a timeout (ms) to avoid blocking.
   */
  private waitForRender(timeoutMs = 5000): Promise<void> {
    if (!this.dagNetwork || !this.dagNetwork.networkRendered) {
      return Promise.resolve();
    }
    const race$ = race(
      this.dagNetwork.networkRendered.pipe(take(1)),
      timer(timeoutMs).pipe(mapTo(undefined))
    ).pipe(takeUntil(this.destroy$));
    return firstValueFrom(race$, { defaultValue: undefined }).then(() => {});
  }

  private setDISSteps(parent: VideoStep, DISSteps: VideoStep[]) {
    this.nodes.push(...DISSteps.filter(step => parent.idetap === step.idpere).map(e => this.videoStepToNode(e)));
  }

  private videoStepToNode(step: VideoStep): Node {
    return {
      id: step.idetap,
      label: this.getLabel(step),
      title: this.getTooltip(step),
      borderWidth: Number(step.reedit) + 1,
      widthConstraint: step.typetp === OccurrenceEtapeStepType.FIN.toString() ? 100 : 380,
      color: this.getNodeColor(step.statut),
      x: this.getPositionX(step),
      y: this.getPositionY(step),
    };
  }

  sortHelperForBtns(a: VideoStep, b: VideoStep): number {
    const ordre = [
      OccurrenceEtapeStepType.BIL,
      OccurrenceEtapeStepType.FIN,
      OccurrenceEtapeStepType.IDT,
      OccurrenceEtapeStepType.FAB,
      OccurrenceEtapeStepType.DIS,
    ] as string[];
    const indexA = ordre.indexOf(a.typetp);
    const indexB = ordre.indexOf(b.typetp);
    return indexA - indexB;
  }

  sortHelperForPositionY(a: VideoStep, b: VideoStep): number {
    const ordre = [
      OccurrenceEtapeStepType.IDT,
      OccurrenceEtapeStepType.FAB,
      OccurrenceEtapeStepType.BIL,
      OccurrenceEtapeStepType.DIS,
      OccurrenceEtapeStepType.FIN,
    ] as string[];
    const indexA = ordre.indexOf(a.typetp);
    const indexB = ordre.indexOf(b.typetp);
    return indexA - indexB;
  }

  getTooltip(step: VideoStep): HTMLElement {
    const SPACE = '\xa0';
    let tip = step.typetp + (step.reedit ? '-R' : '') + SPACE + '(' + step.statut + step.codinf + ')';
    if (step.codsit) {
      tip +=
        SPACE +
        step.codcom +
        step.codfic +
        '-' +
        step.numcom +
        SPACE +
        step.codgam +
        SPACE +
        step.codser +
        SPACE +
        step.codsit +
        ':' +
        step.codres;
      if (step.coddes) {
        tip += ' [' + step.coddes + ']';
      }
    } else if (step.codgam) {
      tip += SPACE + step.codcom + step.codfic + '-' + step.numcom + SPACE + step.codgam;
    } else if (step.codcom) {
      tip += SPACE + step.codcom + step.codfic + '-' + step.numcom;
    }

    const container = document.createElement('div');
    const mainLine = document.createElement('div');
    mainLine.textContent = tip;
    container.appendChild(mainLine);
    if (step.script) {
      const scriptLine = document.createElement('i');
      scriptLine.textContent = step.script;
      container.appendChild(scriptLine);
    }
    return container;
  }

  getLabel(currentVideoStep: VideoStep): string {
    const SPACE = '\xa0';
    let label =
      currentVideoStep.typetp + (currentVideoStep.reedit ? '-R' : '') + SPACE + '(' + currentVideoStep.statut + currentVideoStep.codinf + ')';
    if (currentVideoStep.codsit) {
      label +=
        SPACE +
        currentVideoStep.codcom +
        currentVideoStep.codfic +
        SPACE +
        currentVideoStep.codgam +
        SPACE +
        currentVideoStep.codsit +
        ':' +
        currentVideoStep.codres;
    } else if (currentVideoStep.codgam) {
      label += SPACE + currentVideoStep.codcom + currentVideoStep.codfic + SPACE + currentVideoStep.codgam;
    } else if (currentVideoStep.codcom) {
      label += SPACE + currentVideoStep.codcom + currentVideoStep.codfic;
    }
    return label.trim();
  }

  getPositionX(currentVideoStep: VideoStep): number {
    const positionMap: { [key: string]: number } = {
      [OccurrenceEtapeStepType.DEB.toString()]: -300,
      [OccurrenceEtapeStepType.IDT.toString()]: 0,
      [OccurrenceEtapeStepType.FAB.toString()]: 450,
      [OccurrenceEtapeStepType.BIL.toString()]: 900,
      [OccurrenceEtapeStepType.DIS.toString()]: 900,
      [OccurrenceEtapeStepType.FIN.toString()]: 1200,
    };
    return positionMap[currentVideoStep.typetp];
  }

  getPositionY(currentVideoStep: VideoStep): number {
    const STEP = 50;
    let y = 0;
    if (currentVideoStep.typetp === OccurrenceEtapeStepType.IDT.toString()) {
      const [lastIDTPosition] = this.historyOfIDTPositions.slice(-1);
      const calculatedStep = !lastIDTPosition.numberOfChild ? STEP : lastIDTPosition.numberOfChild * STEP;
      y = lastIDTPosition.y + calculatedStep;
      this.historyOfIDTPositions.push({
        id: currentVideoStep.idetap,
        y: y,
        numberOfChild: this.getNumberOfChildren(currentVideoStep),
      });
    } else if (currentVideoStep.typetp === OccurrenceEtapeStepType.FAB.toString()) {
      const [lastFABPosition] = this.historyOfFABPositions.slice(-1);
      const currentY = lastFABPosition.y + lastFABPosition.numberOfChild * STEP;
      const parentY = this.historyOfIDTPositions.find(e => e.id === currentVideoStep.idpere).y;
      y = parentY > currentY ? parentY : currentY;
      this.historyOfFABPositions.push({
        id: currentVideoStep.idetap,
        y: y,
        numberOfChild: this.getNumberOfChildren(currentVideoStep),
      });
    } else if (currentVideoStep.typetp === OccurrenceEtapeStepType.DIS.toString()) {
      // eslint-disable-next-line no-magic-numbers
      const [lastDISPosition] = this.historyOfDISPositions.slice(-1);
      const currentY = lastDISPosition.y + lastDISPosition.numberOfChild * STEP;
      const parentY = this.historyOfFABPositions.find(e => e.id === currentVideoStep.idpere).y;
      y = parentY > currentY ? parentY : currentY;
      this.historyOfDISPositions.push({
        id: currentVideoStep.idetap,
        y: y,
        numberOfChild: this.getNumberOfChildren(currentVideoStep),
      });
    }
    return y;
  }

  private getNumberOfChildren(currentVideoStep: VideoStep): number {
    if (currentVideoStep.typetp === OccurrenceEtapeStepType.IDT.toString()) {
      return this.videoSteps.filter(v => v.idpere === currentVideoStep.idetap).flatMap(elm => this.videoSteps.filter(vs => vs.idpere === elm.idetap))
        .length;
    }
    return this.videoSteps.filter(v => v.idpere === currentVideoStep.idetap).length;
  }

  setLinks(videoSteps: VideoStep[]): void {
    const staticNodes = [...this.nodes];
    // eslint-disable-next-line no-magic-numbers
    const [lastNode] = [...this.nodes].slice(-1);
    const [firstNode] = [...this.nodes];
    this.edges = videoSteps
      .flatMap((e: VideoStep) => {
        // base case handled by return branches below
        if (e.idpere === firstNode.id) {
          const generatedNodeId = this.generateRandomNodeId();
          this.nodes.push({
            id: generatedNodeId,
            borderWidth: 0,
            color: 'rgb(235, 235, 235)',
            widthConstraint: false,
            shape: 'dot',
            size: 0,
            x: firstNode.x,
            y: staticNodes.find(n => n.id == e.idetap).y,
          });
          return [
            { from: e.idpere, to: generatedNodeId, color: { color: 'rgb(240, 80, 100)' } },
            { from: generatedNodeId, to: e.idetap, color: { color: 'rgb(240, 80, 100)' } },
          ];
        } else if (e.idetap === lastNode.id && staticNodes.find(n => n.id == e.idpere)) {
          const generatedNodeId = this.generateRandomNodeId();
          this.nodes.push({
            id: generatedNodeId,
            borderWidth: 0,
            color: 'rgb(235, 235, 235)',
            widthConstraint: false,
            shape: 'dot',
            size: 0,
            x: lastNode.x,
            y: staticNodes.find(n => n.id == e.idpere).y,
          });
          return [
            { from: e.idpere, to: generatedNodeId, color: { color: 'rgb(240, 80, 100)' } },
            { from: generatedNodeId, to: e.idetap, color: { color: 'rgb(240, 80, 100)' } },
          ];
        } else {
          const generatedNodeId = this.generateRandomNodeId();
          this.nodes.push({
            id: generatedNodeId,
            borderWidth: 0,
            color: 'rgb(235, 235, 235)',
            widthConstraint: false,
            shape: 'dot',
            size: 0,
            x: staticNodes.find(n => n.id === e.idpere).x,
            y: staticNodes.find(n => n.id == e.idetap).y,
          });
          return [
            { from: e.idpere, to: generatedNodeId, color: { color: 'rgb(240, 80, 100)' } },
            { from: generatedNodeId, to: e.idetap, color: { color: 'rgb(240, 80, 100)' } },
          ];
        }
       })
       .map((e: Edge, index: number) => ({ ...e, id: index }));
  }

  generateRandomNodeId(): number {
    const crypto = window.crypto;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const id = 100 + (array[0] % 90000); // Generates a number between 100 and 99999
    const elm = this.nodes.find(node => node.id == id); // Search if some node has the new generated id
    return elm ? this.generateRandomNodeId() : id; // if the new generated id exist we generate a new id
  }

  startStop(): void {
    const REFRESH_INTERVAL = 10000;
    if (this.interval) {
      // arrêter la consultation
      clearTimeout(this.interval);
      this.interval = undefined;
      this.realTimeConsultation = false;
    } else {
      // démarrer la consultation
      this.realTimeConsultation = true;
      const poll = () => {
        // lance une itération, et planifie la suivante 5s après la fin
        this.lister(this.searchEvent).then(() => {
          if (this.realTimeConsultation) {
            this.interval = setTimeout(poll, REFRESH_INTERVAL);
          }
        });
      };
      // lancer immédiatement la première recherche
      poll();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.realTimeConsultation = false;
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = undefined;
    }
    this.listerSub?.unsubscribe();
  }
}
