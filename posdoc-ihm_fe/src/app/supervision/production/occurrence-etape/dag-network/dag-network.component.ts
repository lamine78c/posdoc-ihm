import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Button, StatutForBtn } from '@app/supervision/production/occurrence-etape/models/occurrence-etape-interfaces';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { Observable, Subscription } from 'rxjs';
import { Data, Network, Options } from 'vis-network';
import { IdType } from 'vis-timeline';

@Component({
  selector: 'app-dag-network',
  templateUrl: './dag-network.component.html',
  styleUrls: ['./dag-network.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class DagNetworkComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('network', { static: false }) networkContainer!: ElementRef;
  @ViewChild('visWrapper', { static: false }) visWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('vScrollTrack', { static: false }) vScrollTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('vScrollThumb', { static: false }) vScrollThumb!: ElementRef<HTMLDivElement>;
  @Output() networkRightClick = new EventEmitter();
  @Output() networkRendered = new EventEmitter<number>();
  @Output() networkDoubleClick = new EventEmitter();
  @Input() statutListForBtns: StatutForBtn[];
  @Input() networkData: Observable<Data>;
  @Input() realTimeConsultation: boolean;
  @Output() realTimeConsultationChange = new EventEmitter();
  listOfButtons: Button[];
  network?: Network;
  currentIndex: number;
  currentStatut: string;
  isNetworkDisplayed: boolean;
  scale;
  contentMinY: number;
  contentMaxY: number;
  private networkDataSub?: Subscription;
  private zoomInButton?: HTMLElement;
  private zoomOutButton?: HTMLElement;
  private onZoomBtn?: () => void;
  private scrollbarTimer?: ReturnType<typeof setTimeout>;
  private isDraggingThumb = false;
  private dragStartMouseY = 0;
  private dragStartCameraY = 0;
  private readonly boundOnDocMouseMove = (e: MouseEvent) => this.onDocMouseMove(e);
  private readonly boundOnDocMouseUp = () => this.onDocMouseUp();
  private readonly boundOnWheel = (e: WheelEvent) => this.onWheel(e);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.networkData || !this.networkData) return;

    this.networkDataSub?.unsubscribe();

    this.networkDataSub = this.networkData.subscribe((data: Data) => {
      // On garde l'état caméra (position X, Y, zoom) avant destruction pour le restaurer après ré-affichage,
      // sinon valider/invalider une étape (ou un poll temps réel) recentre l'affichage et l'utilisateur perd de vue
      // l'étape sur laquelle il intervenait.
      const previousPosition = this.network
        ? { x: this.network.getViewPosition().x, y: this.network.getViewPosition().y, scale: this.network.getScale() }
        : undefined;
      this.init();
      this.computeContentBounds(data);
      this.createNetwork(data, previousPosition);
    });
  }

  ngAfterViewInit(): void {
    // passive: false → preventDefault() bloque le scroll de page.
    // capture: true → notre handler passe avant celui de vis-network, stopPropagation l'empêche de zoomer en doublon.
    this.visWrapper.nativeElement.addEventListener('wheel', this.boundOnWheel, { passive: false, capture: true });
  }

  ngOnDestroy(): void {
    this.removeZoomButtonListeners();
    clearTimeout(this.scrollbarTimer);
    this.network?.destroy();
    this.network = undefined;

    if (this.visWrapper) {
      this.visWrapper.nativeElement.removeEventListener('wheel', this.boundOnWheel, { capture: true } as EventListenerOptions);
    }
    document.removeEventListener('mousemove', this.boundOnDocMouseMove);
    document.removeEventListener('mouseup', this.boundOnDocMouseUp);
    if (this.isDraggingThumb) {
      document.body.style.userSelect = '';
    }
  }

  computeContentBounds(data: Data) {
    let minY = Infinity;
    let maxY = -Infinity;
    data.nodes?.forEach(node => {
      if (typeof node.y === 'number') {
        if (node.y < minY) minY = node.y;
        if (node.y > maxY) maxY = node.y;
      }
    });
    // node.y est le CENTRE du nœud : on ajoute une marge pour que le premier/dernier nœud reste entièrement visible aux extrêmes du scroll.
    const PADDING_Y = 80;
    this.contentMinY = Number.isFinite(minY) ? minY - PADDING_Y : 0;
    this.contentMaxY = Number.isFinite(maxY) ? maxY + PADDING_Y : 0;
  }

  init(): void {
    this.isNetworkDisplayed = true;
    this.currentIndex = 0;
    this.listOfButtons = this.getListOfButtons();
    this.contentMinY = 0;
    this.contentMaxY = 0;
  }

  getListOfButtons(): Button[] {
    const titleMap: { [key: string]: string } = {
      C: 'Créé',
      V: 'Validé',
      D: 'Débuté',
      T: 'Terminé',
      I: 'Invalidé',
      S: 'Suspendu',
    };
    return Object.keys(titleMap).map((statut: string) => {
      const nodeNumber = new Set(this.statutListForBtns?.filter(e => e.statut === statut).map(e => e.id)).size;
      return {
        class: 'btn bg-' + statut.toLowerCase(),
        label: titleMap[statut] + (nodeNumber ? ' (' + nodeNumber + ')' : ''),
        statut: statut,
      };
    });
  }

  hoverNextNode(statut: string): void {
    const listOfNodeFiltredWithStatut = this.statutListForBtns.filter(e => e.statut === statut);
    const flatedIsolatedPaths = this.getIsolatedPaths(listOfNodeFiltredWithStatut).flat();
    // Flatten the array of arrays and remove duplicates
    const uniqueNodeIds = [...new Set(flatedIsolatedPaths)];
    if (uniqueNodeIds.length) {
      this.currentStatut !== statut && (this.currentIndex = 0);
      this.currentStatut = statut;
      const nextNodeIdToSelect = uniqueNodeIds[this.currentIndex];
      this.network.focus(nextNodeIdToSelect);
      this.network.selectNodes([nextNodeIdToSelect]);
      this.currentIndex = (this.currentIndex + 1) % uniqueNodeIds.length;
    }
  }

  getIsolatedPaths(data: StatutForBtn[]): number[][] {
    const childrenMap = new Map<number, StatutForBtn[]>();
    data.forEach(node => {
      if (node.idParent) {
        if (!childrenMap.has(node.idParent)) {
          childrenMap.set(node.idParent, []);
        }
        childrenMap.get(node.idParent)?.push(node);
      }
    });
    // Recursively extract paths
    const extractPaths = (node: StatutForBtn): number[][] => {
      const children = childrenMap.get(node.id) || [];
      return !children.length
        ? [[node.id]] // Leaf node
        : children.flatMap(child => extractPaths(child).map(path => [node.id, ...path]));
    };
    // Extract paths starting from root nodes
    return data.flatMap(rootNode => extractPaths(rootNode));
  }

  createNetwork(data: Data, previousPosition?: { x: number; y: number; scale: number }) {
    this.scale = previousPosition?.scale ?? 0.85; // Apply the 85% as init default zoom level
    this.network?.destroy();
    this.network = new Network(this.networkContainer.nativeElement, data, this.networkOptions());
    this.initHover();
    // Add an event listener for 'right mouse click' events on nodes
    this.onRightClick();
    // Add 'doubleClick' event to directly display step information
    this.onDoubleClick();

    const initY = 200;
    const defaultViewPosition = this.network.getViewPosition();
    // Premier affichage : on positionne au centre du graphe (X par défaut) à Y=initY.
    // Re-rendu (après valider/invalider ou poll) : on restaure exactement la position précédente
    // pour rester à l'endroit où l'utilisateur intervenait.
    const targetX = previousPosition ? previousPosition.x : defaultViewPosition.x;
    const targetY = previousPosition ? previousPosition.y : initY;
    this.moveTo(targetX, targetY);

    // Add an event listener for 'dragEnd' event on view to set the new view position
    this.network.on('dragEnd', () => {
      this.clampViewToBounds();
      this.updateScrollbar();
    });

    this.network.on('zoom', () => {
      this.clampViewToBounds();
      this.updateScrollbar();
    });

    // Recalculate the new scale if the btn zoom In/Out are pressed
    this.addZoomButtonListeners();

    // Synchro initiale de la scrollbar une fois que le canvas a sa taille définitive
    clearTimeout(this.scrollbarTimer);
    this.scrollbarTimer = setTimeout(() => this.updateScrollbar(), 0);

    // Notify parent that network rendering/setup is complete
    try {
      // Emit timestamp so parent can compute display duration
      this.networkRendered.emit(Date.now());
    } catch (e) {
      // noop
    }
  }

  onDoubleClick(): void {
    this.network.on('doubleClick', params => {
      const [selectedNodeId] = params.nodes;
      if (selectedNodeId) {
        this.networkDoubleClick.emit({
          id: selectedNodeId,
          position: {
            x: params.event.clientX,
            y: params.event.clientY,
          },
        });
      }
    });
  }

  onRightClick(): void {
    this.network.on('oncontext', (params: any) => {
      params.event.preventDefault();
      // Get the bounding rectangle of the canvas
      const rect = this.networkContainer.nativeElement.getBoundingClientRect();
      // Calculate the x and y coordinates relative to the network canvas
      const x = params.event.clientX - rect.left;
      const y = params.event.clientY - rect.top;
      // Get the node Id by position
      const nodeId: IdType = this.network.getNodeAt({ x: x, y: y });
      if (nodeId) {
        this.networkRightClick.emit({
          id: nodeId,
          position: {
            x: params.event.clientX,
            y: params.event.clientY,
          },
        });
      }
    });
  }

  addZoomButtonListeners() {
    this.removeZoomButtonListeners();
    const root = this.networkContainer.nativeElement as HTMLElement;
    this.zoomInButton = root.querySelector('.vis-button.vis-zoomIn') as HTMLElement;
    this.zoomOutButton = root.querySelector('.vis-button.vis-zoomOut') as HTMLElement;
    this.onZoomBtn = () => {
      this.scale = this.network.getScale();
      this.clampViewToBounds();
      this.updateScrollbar();
    };
    this.zoomInButton?.addEventListener('click', this.onZoomBtn);
    this.zoomOutButton?.addEventListener('click', this.onZoomBtn);
  }

  private removeZoomButtonListeners(): void {
    if (this.onZoomBtn) {
      this.zoomInButton?.removeEventListener('click', this.onZoomBtn);
      this.zoomOutButton?.removeEventListener('click', this.onZoomBtn);
    }
    this.zoomInButton = undefined;
    this.zoomOutButton = undefined;
    this.onZoomBtn = undefined;
  }

  onWheel(event: WheelEvent): void {
    if (!this.network) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.ctrlKey) {
      this.scale = this.zoomInOut(event.deltaY < 0);
      this.clampViewToBounds();
    } else {
      const factor = 0.5;
      const currentPosition = this.network.getViewPosition();
      const newY = this.clampY(currentPosition.y + event.deltaY * factor);
      this.moveTo(currentPosition.x, newY);
    }
    this.updateScrollbar();
  }

  private worldViewportHeight(): number {
    const canvasHeightPx = this.networkContainer?.nativeElement.clientHeight || 0;
    const scale = this.network?.getScale() || 1;
    return scale > 0 ? canvasHeightPx / scale : 0;
  }

  clampY(y: number): number {
    const worldVh = this.worldViewportHeight();
    const half = worldVh / 2;
    const contentHeight = this.contentMaxY - this.contentMinY;
    if (contentHeight <= worldVh) {
      // Le contenu tient dans le viewport : on le centre
      return (this.contentMinY + this.contentMaxY) / 2;
    }
    const effMin = this.contentMinY + half;
    const effMax = this.contentMaxY - half;
    if (y < effMin) return effMin;
    if (y > effMax) return effMax;
    return y;
  }

  clampViewToBounds(): void {
    const pos = this.network.getViewPosition();
    const newY = this.clampY(pos.y);
    if (newY !== pos.y) {
      this.moveTo(pos.x, newY);
    }
  }

  updateScrollbar(): void {
    if (!this.vScrollTrack || !this.vScrollThumb || !this.network) return;
    const trackEl = this.vScrollTrack.nativeElement;
    const thumbEl = this.vScrollThumb.nativeElement;
    const trackHeight = trackEl.clientHeight;
    if (trackHeight === 0) return;

    const contentHeight = this.contentMaxY - this.contentMinY;
    const worldVh = this.worldViewportHeight();

    if (contentHeight <= worldVh || contentHeight === 0) {
      thumbEl.style.display = 'none';
      return;
    }

    thumbEl.style.display = '';
    const ratio = worldVh / contentHeight;
    const thumbHeight = Math.max(24, Math.floor(trackHeight * ratio));
    thumbEl.style.height = thumbHeight + 'px';

    const cameraY = this.network.getViewPosition().y;
    const effMin = this.contentMinY + worldVh / 2;
    const effMax = this.contentMaxY - worldVh / 2;
    const cameraRange = effMax - effMin;
    const scrollRatio = cameraRange > 0 ? (cameraY - effMin) / cameraRange : 0;
    const clamped = Math.max(0, Math.min(1, scrollRatio));
    thumbEl.style.top = Math.round((trackHeight - thumbHeight) * clamped) + 'px';
  }

  onThumbMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.network) return;
    this.isDraggingThumb = true;
    this.dragStartMouseY = event.clientY;
    this.dragStartCameraY = this.network.getViewPosition().y;
    // Empêche une sélection de texte parasite si la souris passe sur du texte pendant le drag
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', this.boundOnDocMouseMove);
    document.addEventListener('mouseup', this.boundOnDocMouseUp);
  }

  private onDocMouseMove(event: MouseEvent): void {
    if (!this.isDraggingThumb || !this.network) return;
    const trackEl = this.vScrollTrack.nativeElement;
    const thumbEl = this.vScrollThumb.nativeElement;
    const trackHeight = trackEl.clientHeight;
    const thumbHeight = thumbEl.clientHeight;
    const scrollableTrack = trackHeight - thumbHeight;
    if (scrollableTrack <= 0) return;
    const worldVh = this.worldViewportHeight();
    const cameraRange = this.contentMaxY - this.contentMinY - worldVh;
    if (cameraRange <= 0) return;
    const deltaPx = event.clientY - this.dragStartMouseY;
    const newCameraY = this.clampY(this.dragStartCameraY + (deltaPx / scrollableTrack) * cameraRange);
    const currentX = this.network.getViewPosition().x;
    this.moveTo(currentX, newCameraY);
    this.updateScrollbar();
  }

  private onDocMouseUp(): void {
    if (!this.isDraggingThumb) return;
    this.isDraggingThumb = false;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', this.boundOnDocMouseMove);
    document.removeEventListener('mouseup', this.boundOnDocMouseUp);
  }

  onTrackMouseDown(event: MouseEvent): void {
    // Si le clic est sur le thumb, c'est son propre handler qui gère le drag
    if (event.target !== this.vScrollTrack.nativeElement) return;
    if (!this.network) return;
    const trackEl = this.vScrollTrack.nativeElement;
    const thumbEl = this.vScrollThumb.nativeElement;
    const trackHeight = trackEl.clientHeight;
    const thumbHeight = thumbEl.clientHeight;
    const scrollableTrack = trackHeight - thumbHeight;
    if (scrollableTrack <= 0) return;
    const worldVh = this.worldViewportHeight();
    const cameraRange = this.contentMaxY - this.contentMinY - worldVh;
    if (cameraRange <= 0) return;
    const clickYInTrack = event.clientY - trackEl.getBoundingClientRect().top;
    const ratio = Math.max(0, Math.min(1, (clickYInTrack - thumbHeight / 2) / scrollableTrack));
    const newCameraY = this.contentMinY + worldVh / 2 + ratio * cameraRange;
    const currentX = this.network.getViewPosition().x;
    this.moveTo(currentX, newCameraY);
    this.updateScrollbar();
  }

  moveTo(newXPosition: number, newYPosition: number): void {
    this.network.moveTo({
      scale: this.scale,
      position: { x: newXPosition, y: newYPosition }, // Optionally center on a specific point
    });
  }

  zoomInOut(isZoomIn: boolean): number {
    const currentScale = this.network.getScale();
    const zoomInFactor = 1.2; // Zoom in by 20%
    const zoomOutFactor = 0.8; // Zoom out by 20%
    const newScale = isZoomIn ? currentScale * zoomInFactor : currentScale * zoomOutFactor;
    this.network.moveTo({ scale: newScale }); // Zoom in/out
    return newScale;
  }

  networkOptions(): Options {
    return {
      physics: false, // Disable physics for a static layout
      height: '100%',
      width: '100%',
      autoResize: true,
      nodes: {
        fixed: true,
        chosen: {
          node: (values, id, isSelected, isHovering) => {
            values.borderWidth = 2;
            if (isSelected) {
              values.borderColor = 'red';
            }
            if (isHovering) {
              values.borderColor = 'blue';
            }
          },
          label: values => {
            values.color = 'black';
          },
        },
        shape: 'box', // Rectangular nodes
        shapeProperties: {
          borderRadius: 0,
        },
        font: {
          size: 16, // Optional: Adjust the font size
          align: 'center', // Center the label inside the node
          color: 'black', // Optional: Change label color
          vadjust: 0,
        },
      },
      interaction: {
        navigationButtons: true,
        zoomView: false, // Disable zoom of view
        dragNodes: false, // Disable interaction (dragging) of nodes
        dragView: true, // Disable interaction (dragging) of view
        hover: true, // Required to enable the hover event
      },
    };
  }

  initHover(): void {
    // On hover over a node, change the cursor to pointer
    this.network.on('hoverNode', () => {
      this.networkContainer.nativeElement.style.cursor = 'pointer';
    });
    // When not hovering over a node, reset the cursor
    this.network.on('blurNode', () => {
      this.networkContainer.nativeElement.style.cursor = 'default';
    });
  }

  startStop(): void {
    this.realTimeConsultation = !this.realTimeConsultation;
    this.realTimeConsultationChange.emit();
  }
}
