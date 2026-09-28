import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { OccurencePerApplication } from '@app/models/supervision/production/occurence-per-application';
import {
  APP_OCCURRENCES_STATUS_CREATED,
  APP_OCCURRENCES_STATUS_DELETED,
  APP_OCCURRENCES_STATUS_SUSPENDED,
  APP_OCCURRENCES_STATUS_TERMINATED,
  getFormIndex,
} from '@app/shared/utils/Constants';
import SharedUtil from '@app/shared/utils/SharedUtil';
import { DataSet } from 'vis-data';
import { DataGroup, DataItem, Timeline, TimelineOptions } from 'vis-timeline';
import { MenuTimeLineOccAppInterface } from '../model/timeline-menu';
import { TimelineOccAppMenuService } from '../service/timeline-occ-app-menu.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  standalone: false,
})
export class TimelineComponent implements OnChanges, OnDestroy  {
  @ViewChild('timeline', { static: true }) timelineContainer: ElementRef;
  @Input() dataInput: OccurencePerApplication[];
  @Input() isIntervalStart: boolean; // true = démarrer le video, false = arrêter le video
  @Input() dateDebut: Date;
  contextMenuStyle = { display: 'none', top: '0px', left: '0px' };
  selectedItem: any;
  timeline: Timeline;
  dataTimeLine = [];
  nbrDataCree: number;
  nbrDataSuspendu: number;
  nbrDataDebute: number;
  nbrDataTermine: number;
  occurrenceStatus = '';
  contextMenuOptions;
  toShowStatus = false;
  toShowStatusCree = false;
  toShowStatusSuspendu = false;
  toShowStatusDebute = false;
  toShowStatusTermine = false;
  isIntervalStarted: boolean; // true = le video est démarré, false = le video est arrêté
  @Output() applySearchEvent = new EventEmitter<any>();
  formIndex = getFormIndex();

  private readonly menuService = inject(TimelineOccAppMenuService);

  constructor() {
    // do nothing
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(): void {
    this.contextMenuStyle.display = 'none';
  }

  ngOnChanges() {
    if ((this.isIntervalStart || !this.isIntervalStarted) && this.dataInput?.length) {
      this.calculNbrDataByStatus();
      this.filterDataByStatus();
    }
    this.isIntervalStarted = this.isIntervalStart;
  }

  ngOnDestroy(): void {
    try {
      this.timeline?.destroy();
    } catch {
      // vis-timeline rejoue ses templates pendant destroy() ;
      // une exception ici stopperait la chaîne de destruction d'Angular
    }
    this.timeline = undefined;
  }

  calculNbrDataByStatus() {
    // calculer le nombre de chaque status
    this.nbrDataTermine = 0;
    this.nbrDataCree = 0;
    this.nbrDataSuspendu = 0;
    this.nbrDataDebute = 0;
    this.dataInput.forEach(e => {
      switch (e.appsta) {
        case APP_OCCURRENCES_STATUS_TERMINATED:
          this.nbrDataTermine++;
          break;
        case APP_OCCURRENCES_STATUS_DELETED:
          this.nbrDataDebute++;
          break;
        case APP_OCCURRENCES_STATUS_CREATED:
          this.nbrDataCree++;
          break;
        case APP_OCCURRENCES_STATUS_SUSPENDED:
          this.nbrDataSuspendu++;
          break;
        default:
          break;
      }
    });
  }

  getItemByProperties(properties) {
    let item = null;
    // item clicked
    if (properties.what === 'item' && properties.item != null) {
      item = properties.item;
    }
    // group clicked
    else if (properties.what === 'group-label' && properties.group != null) {
      (this.timeline as any).itemsData.forEach(e => {
        if (e.group === properties.group) {
          item = e.id;
        }
      });
    }
    return item;
  }

  createTimeline(items: any, groups: any, options: any): Timeline {
    return new Timeline(this.timelineContainer.nativeElement, items, groups, options);
  }

  updateTimeline() {
    const deb = new Date(this.dateDebut);
    const cur = new Date();
    const hourInMiliSec = 3600000;
    const diff = Math.floor((cur.getTime() - deb.getTime()) / hourInMiliSec);
    const items = this.getTimelineItems(diff);
    const groups = this.getTimelineGroups();
    const options = this.getOptions();
    if (this.timeline === undefined) {
      // créer un new timeline si non existe
      this.toShowStatus = false;
      this.timeline = this.createTimeline(items, groups, options);
      // Ajouter des écouteurs d'événements si nécessaire
      this.timeline.on('contextmenu', properties => {
        properties.event.preventDefault();
        const item = this.getItemByProperties(properties);
        if (item != null) {
          this.showContextMenu(properties.event, item);
        }
      });
      // Ajouter un écouteur d'événements pour le clic gauche
      this.timeline.on('click', properties => {
        const item = this.getItemByProperties(properties);
        if (item != null) {
          const selectedItem = (this.timeline as any).itemsData.get(item);
          this.menuService.openPopupDetails(selectedItem);
        }
      });
    } else {
      // mettre à jour des données sur timeline
      this.timeline.setData({ items: items, groups: groups });
      this.timeline.setOptions(options);
    }
  }

  getTimelineItems(diff): DataSet<DataItem> {
    return new DataSet(
      this.dataTimeLine.map((e: OccurencePerApplication, index: number) => {
        const { start, end } = this.calculateStartDate(e.dappld, e.dapplt, e.appsta, diff);

        return {
          id: index,
          group: e.groupId,
          content: '',
          start: start,
          end: end,
          className:
            e.appsta === APP_OCCURRENCES_STATUS_TERMINATED
              ? 'bg-termine item-timeline'
              : e.appsta === APP_OCCURRENCES_STATUS_DELETED
                ? 'bg-debute item-timeline'
                : e.appsta === APP_OCCURRENCES_STATUS_CREATED
                  ? 'bg-cree item-timeline'
                  : e.appsta === APP_OCCURRENCES_STATUS_SUSPENDED
                    ? 'bg-debute item-timeline'
                    : '',
          appsta: e.appsta,
          codenv: e.codEnv,
          codorg: e.codOrg,
          codapp: e.codApp,
          percod: e.perCod,
        };
      })
    );
  }

  /**
   * Calculer les dates de fin en fonction de la date de début, de la date de fin et du statut de l'application
   * @param dappld
   * @param dapplt
   * @param appsta
   * @private
   */
  private calculateStartDate(dappld: string, dapplt: string, appsta: string, diff: number): { start: Date; end: Date | null } {
    let start = new Date(dappld);
    const end =
      appsta === APP_OCCURRENCES_STATUS_TERMINATED
        ? new Date(dapplt)
        : appsta === APP_OCCURRENCES_STATUS_DELETED || appsta === APP_OCCURRENCES_STATUS_SUSPENDED
          ? new Date()
          : null;

    const min_minutes = (diff * 5) / 12;

    // Vérifier si l'intervalle est inférieur à 15 minutes
    if (end && end.getTime() - start.getTime() < min_minutes * 60000) {
      // Ajouter du temps supplémentaire (par exemple, 15 min) à l'heure de fin pour mieux voir la timeline
      start = new Date(end.getTime() - min_minutes * 60000);
    }

    return { start, end };
  }

  getTimelineGroups(): DataGroup[] {
    return this.dataTimeLine.map((e: OccurencePerApplication) => {
      const content = `${e.codEnv}${e.codOrg}${e.codApp} ${e.perCod}
      ${e.codSit ? `(${e.codSit})` : ''}
      ##${e.appsta === APP_OCCURRENCES_STATUS_CREATED && !e.dapplc && !e.dappld && !e.dapplt}
    `.trim();

      const style = e.appsta === APP_OCCURRENCES_STATUS_SUSPENDED ? 'background-color: #f0b4be;' : '';

      return { id: e.groupId, content, style };
    });
  }

  getOptions(): TimelineOptions {
    const now = new Date();
    return {
      stack: true,
      height: '500px',
      zoomable: false,
      verticalScroll: true,
      min: new Date(this.dateDebut).setHours(0, 0, 0), // Bloquer la vision sur les jours avant la date début sélectionnée
      start: new Date(this.dateDebut).setHours(0, 0, 0),
      end: new Date().setHours(now.getHours() + 1, now.getMinutes(), now.getSeconds()), // mettre la fin = l'heure actuelle + 1h
      editable: false,
      orientation: 'top',
      margin: {
        axis: 0,
      },
      format: {
        majorLabels: (date: Date) => SharedUtil.formatDateToDDMMYYYY(date.toLocaleString()),
      },
      onInitialDrawComplete: () => {
        // si le timeline est créé
        this.toShowStatus = true; // afficher le barre des status
      },
      groupTemplate: group => {
        // vis-timeline rejoue ce template pendant destroy() avec un group null
        if (!group?.content) {
          return document.createElement('div');
        }
        const displayFlag = group.content.split('##')[1];
        const container = document.createElement('div');
        const label = document.createElement('span');
        label.innerHTML = group.content.split('##')[0];
        container.insertAdjacentElement('afterbegin', label);
        const flagIcon = document.createElement('img');
        flagIcon.src = 'assets/icons/flag/flag16x16_jaune.png';
        flagIcon.alt = 'flag';
        flagIcon.title = 'Application non débutée';
        if (displayFlag === false.toString()) {
          flagIcon.style.display = 'none';
        }
        container.insertAdjacentElement('beforeend', flagIcon);
        return container;
      },
    };
  }

  showContextMenu(event: MouseEvent, item): void {
    const selectedItem = (this.timeline as any).itemsData.get(item);
    const menuWidth = 250; // largeur estimée de la div
    const screenWidth = window.innerWidth;
    let left = event.clientX;
    const top = event.clientY;

    if (left + menuWidth > screenWidth) {
      left = left - menuWidth;
    }

    this.contextMenuStyle = {
      display: 'block',
      top: `${top}px`,
      left: `${left}px`,
    };

    this.selectedItem = item;
    this.occurrenceStatus = selectedItem.appsta;
    this.contextMenuOptions = this.menuService.getMenuByStatus(this.occurrenceStatus);
  }

  onMenuOptionClick(option: MenuTimeLineOccAppInterface): void {
    this.contextMenuStyle = { display: 'none', top: '0px', left: '0px' };
    const selectedItem = (this.timeline as any).itemsData.get(this.selectedItem);
    this.menuService.onMenuOptionClick(option, selectedItem, this.applySearchEvent);
  }

  filterDataByStatusSuspendu(): void {
    this.toShowStatusSuspendu = !this.toShowStatusSuspendu; // switcher l'affichage statut suspendu
    this.filterDataByStatus();
  }

  filterDataByStatusTermine(): void {
    this.toShowStatusTermine = !this.toShowStatusTermine; // switcher l'affichage statut termine
    this.filterDataByStatus();
  }

  filterDataByStatusDebute(): void {
    this.toShowStatusDebute = !this.toShowStatusDebute; // switcher l'affichage statut debute
    this.filterDataByStatus();
  }

  filterDataByStatusCree(): void {
    this.toShowStatusCree = !this.toShowStatusCree; // switcher l'affichage statut cree
    this.filterDataByStatus();
  }

  filterDataByStatus(): void {
    // renvoyer les données selon status demandé(multiple possible) sans changer de l'ordre
    // renvoyer toutes les données si aucun status précisé
    this.dataTimeLine = this.dataInput.filter(
      e =>
        (!this.toShowStatusCree && !this.toShowStatusDebute && !this.toShowStatusSuspendu && !this.toShowStatusTermine) ||
        (e.appsta === APP_OCCURRENCES_STATUS_TERMINATED && this.toShowStatusTermine) ||
        (e.appsta === APP_OCCURRENCES_STATUS_DELETED && this.toShowStatusDebute) ||
        (e.appsta === APP_OCCURRENCES_STATUS_CREATED && this.toShowStatusCree) ||
        (e.appsta === APP_OCCURRENCES_STATUS_SUSPENDED && this.toShowStatusSuspendu)
    );
    this.dataTimeLine.length && this.updateTimeline();
  }

  isStatusSuspenduEnabled(): boolean {
    return this.nbrDataSuspendu && !this.isIntervalStart;
  }

  isStatusCreeEnabled(): boolean {
    return this.nbrDataCree && !this.isIntervalStart;
  }

  isStatusDebuteEnabled(): boolean {
    return this.nbrDataDebute && !this.isIntervalStart;
  }

  isStatusTermineEnabled(): boolean {
    return this.nbrDataTermine && !this.isIntervalStart;
  }
}
