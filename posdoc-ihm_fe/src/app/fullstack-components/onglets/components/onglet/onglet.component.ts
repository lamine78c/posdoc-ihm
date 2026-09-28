import {
  EventEmitter,
  Input,
  Output,
  Component,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { NgbModal, NgbModalRef, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { NextActiveTab, OngletPremierNiveauIcone } from '../../models/onglets.models';
import { OngletHeaderContainerComponent } from '../onglet-header-container/onglet-header-container.component';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

export enum OngletTypeEnum {
  PREMIER_NIVEAU = 'PREMIER_NIVEAU ',
  PREMIER_NIVEAU_ICONE = 'PREMIER_NIVEAU_ICONE',
  DEUXIEME_NIVEAU = 'DEUXIEME_NIVEAU',
}

@Component({
  selector: 'app-onglet',
  templateUrl: './onglet.component.html',
  styleUrls: ['./onglet.component.scss'],
  standalone: false,
})
export class OngletComponent implements AfterContentInit, OnDestroy, AfterViewChecked, OnChanges {
  @ViewChild('ulElement') ulElement: ElementRef;

  /**
   * Récupère le template pour l'header passé en tant que contenant du composant
   */
  @ContentChildren(OngletHeaderContainerComponent) inputHeaderComponent: QueryList<OngletHeaderContainerComponent>;
  /**
   * Type d'onglet à afficher
   */
  @Input() type: OngletTypeEnum;
  /**
   * Numéro de l'onglet sélectionnée par défaut
   * Utiliser pour variable afin de récupérer l'output de la valeur
   */
  @Input() active: number;
  /**
   * Prochain onglet actif après une suppression
   */
  @Input() nextActive: NextActiveTab;
  /**
   * Affiche la navigation dans les onglets
   */
  @Input() displayNav = false;
  /**
   * Vitesse de navigation dans les onglets
   */
  @Input() navScroll = 150;
  /**
   * Afficher le bouton permettant de fermer tous les onglets
   * Uniquement disponible si la navigation est affichée
   */
  @Input() displayCloseAll = true;
  /**
   * Les différents onglets
   * Utilisé uniquement pour les onglets avec navigation
   */
  @Input() tabs: OngletPremierNiveauIcone[];
  /**
   * Renvoie l'objet "NgbNavChangeEvent" avant que le changement de navigation se produise lors du clic de l'utilisateur
   */
  @Output() activeChange = new EventEmitter<any>();
  /**
   * Envoie un message avec la nouvelle liste d'onglets
   */
  @Output() tabsChange = new EventEmitter<OngletPremierNiveauIcone[]>();
  /**
   * Envoie un message contenant la nouvelle valeur de nextActiveChange
   */
  @Output() nextActiveChange = new EventEmitter<{ value: number; isLast: boolean }>();

  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;
  headerComponents: OngletHeaderContainerComponent[];
  subscription: Subscription;
  modalRef: NgbModalRef;

  nativeElement: HTMLElement;
  maxScrollLeft: number;

  disableLeftNavigation = false;
  disableRightNavigation = false;
  disableCloseButton = false;

  constructor(
    private modalService: NgbModal,
    private cd: ChangeDetectorRef
  ) {}

  /**
   * Lorsqu'un onglet est supprimé, il faut attendre que l'affiche de l'onglet prenant sa position soit réalisé
   * avant de changer l'onglet actif, sinon le contenu de l'onglet ne s'affiche pas
   *
   * Le composant parent passe donc à ce composant le prochain onglet que l'on souhaite voir actif (nextActive)
   * Puis, lorsque show est trigger par ngbNav, on met à jour la valeur de l'onglet actif
   * Enfin, on reset la valeur de nextActive
   */
  onShow() {
    if (this.nextActive) {
      this.activeChange.emit(this.nextActive.value);
      this.nextActive = null;
      this.nextActiveChange.emit(null);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Dans le cas ou l'onglet sélectionné est le dernier, aucun onglet est affiché entre temps
    // On appel donc manuellement onShow lorsque nextActive est renseigné
    if (changes.nextActive && this.nextActive?.isLast) {
      this.onShow();
    }
  }

  /**
   * Met à jour l'onglet sélectionné
   */
  navChange(event: NgbNavChangeEvent): void {
    this.activeChange.emit(event);
  }

  /**
   * Une fois que la vue est chargée, vérifie le status des icônes de navigation
   */
  ngAfterViewChecked(): void {
    if (this.displayNav) {
      this.setNativeElement();
      this.checkLimits();
      this.checkCloseButton();
      // Force la détection de changement pour éviter l'erreur : ExpressionChangedAfterItHasBeenCheckedError
      this.cd.detectChanges();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setNativeElement();
    this.checkLimits();
  }

  /**
   * Une fois le contenu chargé, récupère les headers passés en paramètre
   * À chaque changement sur ses headers, met à jour les icônes de navigation
   */
  ngAfterContentInit(): void {
    this.headerComponents = this.inputHeaderComponent.toArray();

    if (this.displayNav) {
      this.subscription?.unsubscribe();
      this.subscription = this.inputHeaderComponent.changes.subscribe(() => {
        this.headerComponents = this.inputHeaderComponent.toArray();
        setTimeout(() => {
          this.setNativeElement();
          this.checkLimits();
          this.checkCloseButton();
        });
      });
    }
  }

  /**
   * Récupère l'élément ul après le chargement
   */
  setNativeElement(): void {
    this.nativeElement = this.ulElement.nativeElement as HTMLElement;
    this.maxScrollLeft = this.nativeElement.scrollWidth - this.nativeElement.clientWidth - 1;
  }

  /**
   * Scroll à droite si possible et vérifie le status des icônes de navigation
   */
  scrollRight(): void {
    if (this.nativeElement.scrollLeft < this.maxScrollLeft) {
      const currentScroll = this.nativeElement.scrollLeft;
      this.nativeElement.scroll({ left: currentScroll + this.navScroll });
      this.checkLimits();
    }
  }

  /**
   * Scroll à gauche si possible et vérifie le status des icônes de navigation
   */
  scrollLeft(): void {
    if (this.nativeElement.scrollLeft > 0) {
      const currentScroll = this.nativeElement.scrollLeft;
      this.nativeElement.scroll({ left: currentScroll - this.navScroll });
      this.checkLimits();
    }
  }

  /**
   * Vérifie le statut des icônes de navigation
   */
  checkLimits(): void {
    this.disableLeftNavigation = false;
    this.disableRightNavigation = false;

    if (this.nativeElement.scrollLeft === 0) {
      this.disableLeftNavigation = true;
    }

    if (this.nativeElement.scrollLeft >= this.maxScrollLeft) {
      this.disableRightNavigation = true;
    }
  }

  /**
   * Affiche une modale de confirmation, en cas de confirmation :
   * Ferme tous les onglets qui peuvent être fermés
   * Puis envoie un message avec la nouvelle liste d'onglets
   */
  closeAllTabs(): void {
    this.modalRef = this.modalService.open(PopupConfirmationComponent);
    this.modalRef.componentInstance.closedNumber = this.tabs.filter((onglet: OngletPremierNiveauIcone) => onglet.canClose).length;

    this.modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
      if (numButton === NUM_FIRST_BTN_MODAL) {
        this.tabsChange.emit(this.tabs.filter((onglet: OngletPremierNiveauIcone) => !onglet.canClose));
        // Si il existe encore un onglet, le sélectionne
        if (this.tabs.length > 0) {
          this.active = 0;
        }
      }
    });
  }

  /**
   * Vérifie le statut du bouton permettant de fermer tous les onglets
   */
  checkCloseButton(): void {
    this.disableCloseButton = !this.tabs.find((tab: OngletPremierNiveauIcone) => tab.canClose);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
