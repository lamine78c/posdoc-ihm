import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { Arborescence } from '@app/fullstack-components/arborescence/models/aborescence.models';
import { Profile } from '@app/models/profile';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';

import { ApiAdelaideProfileService } from 'src/app/services/api-adelaide-profile.service';
import { PopupConfirmationComponent } from '../popup/popup-confirmation/popup-confirmation.component';
import { PopupDuplicateProfileComponent } from '../popup/popup-duplicate-profile/popup-duplicate-profile.component';
import { PopupErreurComponent } from '../popup/popup-erreur/popup-erreur.component';
import { LoginService } from '@acoss/prisme-angular-intranet';
import { ActivatedRoute } from '@angular/router';
import { NotesService, ToastCategoryEnum } from '@app/fullstack-components/notes/services/notes.service';
import { take } from 'rxjs/operators';
import { ArborescenceCollapseComponent } from '@app/fullstack-components/arborescence/components/arborescence-collapse/arborescence-collapse.component';
import { NUM_FIRST_BTN_MODAL } from '@app/fullstack-components/utils/Constants';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';

@Component({
  selector: 'app-habilitation',
  templateUrl: './habilitations.component.html',
  styleUrls: ['./habilitations.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class HabilitationsComponent implements OnInit {
  // l'arbre qui représente les habilis
  tree: Arborescence[] = [];

  subscriptions: Subscription[] = [];

  //liste des profiles afficher
  profiles: Profile[];

  //la valeur du profile séléctionner actuellemnt.
  currentProfilSelectValue: string;

  // la liste de toutes les habilitations existantes
  allHabilitations = [];

  // les habilitation initial de chaque profile actif
  initialHabilitations = [];

  // les habilitations changé pour le profile actif
  currentHabilitations = [];

  // item séléctionner
  itemClicked;

  // les actions afficher
  actions = [];

  // les authorisation avancer
  authorisations = [];

  // bouton initialisation des permissions
  initButton = true;

  // bouton sauvegarde et annuler
  dataChanged = false;

  private readonly apiProfileService = inject(ApiAdelaideProfileService);
  private readonly modalService = inject(NgbModal);
  private readonly loginService = inject(LoginService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly noteService = inject(NotesService);

  // le profile active
  profileActive: any = { profile: this.loginService.getInfos().infosUtilisateurFront.hrProfil };

  constructor() {
    this.subscriptions.push(
      this.activatedRoute.data.subscribe(
        ({ habilitations }) => {
        this.allHabilitations = habilitations.data.allHabilitations;
        this.tree = unflatten(
          habilitations.data.allHabilitations
            .map(e => {
              e.text = e.identite;
              e.expandChildByDefault = true;
              return e;
            })
            .filter(e => e.habilitationType != 'CONTROLE' && e.habilitationType != 'FORMULAIRE'),
          []
        );
      },
        erreur => {
          console.error('erreur lors de la récupération des permissions');
        }
      )
    );
  }

  ngOnInit() {
    // mettre cette variable static a zero pour annuler l'item selectionner
    ArborescenceCollapseComponent.idItemSelected = 0;

    // récupératiuon de tous les profiles existants
    this.subscriptions.push(
      this.apiProfileService.getProfileList().subscribe(result => {
        this.profiles = (result as any).data.allProfiles;
      })
    );

    this.subscriptions.push(
      this.apiProfileService.getProfileById(this.profileActive.profile).subscribe(result => {
      this.profileActive = (result as any).data.profile;
      this.initialHabilitations = (result as any).data.profile.habilitations;

      this.initialHabilitations.forEach(e => {
        this.currentHabilitations[e.id] = JSON.parse(JSON.stringify(e));
      });

      initialiseHabilitation(this.tree, this.initialHabilitations);
      })
    );
  }

  /**
   * methode appler lors du clique sur un item de l'arbre,
   * récupère l'etat, sois du tableau enCours si c'est en cours de modification,
   * nison on récuoère l'etat du tableau initial
   * @param event Id de l'item selectionner dans l'arbre
   */
  @HostListener('habilitationClicked', ['$event.detail'])
  habilitationClicked(event): void {
    //item (habilitations) selection (en cour de modif)
    this.itemClicked = event;

    // onrécupère toutes les actions et auth anfant de l'item selectionner
    // et on vérifier dans la liste currentHabilitation, pour voir si true or false
    const ctrl = this.allHabilitations.filter(e => e.parentId == event.id);

    this.actions = ctrl
      .filter(e => e.habilitationType == 'CONTROLE')
      .sort((a, b) => a.ordre - b.ordre)
      .map(e => {
        this.currentHabilitations.map(e => e.id).includes(e.id) ? (e.value = true) : (e.value = false);
        return Object.assign({}, e);
      });

    this.authorisations = ctrl
      .filter(e => e.habilitationType == 'FORMULAIRE')
      .sort((a, b) => a.ordre - b.ordre)
      .map(e => {
        this.currentHabilitations.map(e => e.id).includes(e.id) ? (e.value = true) : (e.value = false);
        return Object.assign({}, e);
      });

    this.initButton = this.areHabilitationchanged(
      this.currentHabilitations.filter(e => e.parentId == event.id),
      this.initialHabilitations.filter(e => e.parentId == event.id)
    );
  }

  @HostListener('habilitationSelected', ['$event.detail'])
  habilitationSelected(event) {
    this.addOrRemoveOneHabili(event);
    this.dataChanged = this.areHabilitationchanged(this.currentHabilitations, this.initialHabilitations);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  /**
   * charger un autre profile
   * @param event event de la liste duprofile selectionné
   */
  changeProfile(codeProfile) {
    if (!this.dataChanged) {
      this.subscriptions.push(
        this.apiProfileService.getProfileById(codeProfile).subscribe({
        next: result => {
          this.profileActive = (result as any).data.profile;
          this.initialHabilitations = (result as any).data.profile.habilitations;
          this.currentHabilitations = [];
          this.initialHabilitations.forEach(e => {
            this.currentHabilitations[e.id] = JSON.parse(JSON.stringify(e));
          });

          initialiseHabilitation(this.tree, this.initialHabilitations);
        },
        error: error => {
          console.error(error);
        },
        })
      );

      this.actions = [];
      this.authorisations = [];
      this.itemClicked = null;

      // mettre cette variable static a zero pour annuler l'item selectionner
      ArborescenceCollapseComponent.idItemSelected = 0;
    } else {
      const modalRef = this.modalService.open(PopupErreurComponent);
      modalRef.componentInstance.messages = [
        'Changement non sauvegardé',
        'Des modifications non enregistrées ont été détectées.',
        'Vous devez enregistrer avant de changer de profil.',
      ];
    }
  }

  /**
   * supprimer un profile
   */
  supprimerProfils() {
    const profileToDuplicate = this.profileActive.profile + ' - ' + this.profileActive.libelleProfile;
    const modalRef = this.modalService.open(PopupConfirmationComponent);
    modalRef.componentInstance.rowDataArray = [profileToDuplicate];
    modalRef.componentInstance.messages = ["Suppression d'un profil utilisateur", 'Vous êtes sur le point de supprimer le profil'];

    this.subscriptions.push(
      modalRef.dismissed.pipe(take(1)).subscribe((numButton: number) => {
        if (numButton === NUM_FIRST_BTN_MODAL) {
          this.subscriptions.push(
            this.apiProfileService.deleteProfile(this.profileActive.profile).subscribe({
              next: ({ data }) => {
                this.profiles = this.profiles.filter(e => e.profile != this.profileActive.profile);
                this.noteService.show({
                  title: `Le profile "${this.profileActive.profile}" a été supprimé avec succès`,
                  classname: 'note-confirmation',
                  category: ToastCategoryEnum.SUCCESS,
                });
                // recharge le profile administratur apres supression
                this.changeProfile('NAT_ADMINISTRATEUR');
              },
              error: error => {
                console.error(error);
                this.noteService.show({
                  title: `Echec de la suppression du profile "${this.profileActive.profile}" : ${error.message} `,
                  classname: 'note-erreur',
                  delay: 300000,
                  category: ToastCategoryEnum.ERROR,
                });
              },
            })
          );
        }
      })
    );
  }

  /**
   * ajouter toute les habilitation
   */
  allVisible() {
    initialiseHabilitation(this.tree, true);
    // ajoute toutes les habilitations
    this.allHabilitations.forEach(e => {
      this.currentHabilitations[e.id] = JSON.parse(JSON.stringify(e));
    });
    // décoche les authorisations actives
    this.authorisations.forEach(e => (e.value = true));
    // décoche les actions actives
    this.actions.forEach(e => (e.value = true));
  }

  /**
   * supprime toutes les habilitation
   */
  allNonVisible() {
    //décoche l'arbre.
    initialiseHabilitation(this.tree, false);
    // supprime les habiliataion est action
    this.currentHabilitations = [];
    // décoche les authorisations actives
    this.authorisations.forEach(e => (e.value = false));
    // décoche les actions actives
    this.actions.forEach(e => (e.value = false));
  }

  /**
   * reinitialise les permissions a l'etat initial
   */
  reinitialise() {
    const habiliToInit = this.allHabilitations.filter(e => e.parentId == this.itemClicked.id);
    this.addOrRemoveHabiliList(habiliToInit);
    this.habilitationClicked(this.itemClicked);
    this.dataChanged = this.areHabilitationchanged(this.currentHabilitations, this.initialHabilitations);
  }

  /**
   * methode appeler lors du click sur une authorisation ou action
   * @param event evenement renvoyer
   * @param habili l'habilitation concerner
   */
  actionOrAuthChange(event, habili) {
    // Si l'action "Modifier" est cochée, mettre à jour les autorisations
    if (event.target.id.toLowerCase() == 'Modifier'.toLowerCase()) {
      this.authorisations.forEach(e => {
        e.value = event.target.checked;
        this.addOrRemoveOneHabili(e);
      });
    }

    // Ajouter ou supprimer l'habilitation correspondante
    this.addOrRemoveOneHabili(habili);

    // Vérifier les modifications pour mettre à jour les boutons
    this.initButton = this.areHabilitationchanged(
      this.currentHabilitations.filter(e => e.parentId == habili.parentId),
      this.initialHabilitations.filter(e => e.parentId == habili.parentId)
    );
    this.dataChanged = this.areHabilitationchanged(this.currentHabilitations, this.initialHabilitations);
  }

  canDeactivate(): Observable<boolean> | boolean {
    // si pas de modification en cours
    if (this.dataChanged) {
      return new Observable(observer => {
        const modalRef = this.modalService.open(PopupErreurComponent);
        modalRef.componentInstance.messages = [
          'Changement non sauvegardé',
          'Des modifications non enregistrées ont été détectées.',
          'Êtes-vous sûr de vouloir quitter ?',
        ];

        modalRef.closed.subscribe(() => {
          observer.next(false);
          observer.complete();
        });

        modalRef.result.catch(error => {
          const res = error == 2;
          observer.next(res);
          observer.complete();
        });
      });
    }
    return true;
  }

  /**
   * vérifier que les deux liste contiennent les memes habilitation
   * @param currentHabilitations premiere liste
   * @param initialHabilitations deuxieme liste
   * @returns oui ou non si les liste son identique
   */
  private areHabilitationchanged(currentHabilitations, initialHabilitations) {
    // compare si il y a les meme habilitation
    return (
      currentHabilitations
        .filter(e => e != null)
        .map(e => e.id)
        .sort((n1, n2) => n1 - n2)
        .join('') !==
      initialHabilitations
        .filter(e => e != null)
        .map(e => e.id)
        .sort((n1, n2) => n1 - n2)
        .join('')
    );
  }

  /**
   * Ajoute ou supprime une habilitation au current habilitation
   * on check l'etat de l'habili pour savoir si on l'ajoute ou supprime
   * @param habilis liste des habilitation a ajouter ou supprimer
   */
  private addOrRemoveOneHabili(habili) {
    if (habili.value) {
      this.currentHabilitations[habili.id] = JSON.parse(JSON.stringify(habili));
    } else {
      const r = [];
      this.currentHabilitations
        .filter(e => {
          return e.id != habili.id && e.parentId != habili.id;
        })
        .forEach(e => (r[e.id] = e));
      this.currentHabilitations = r;

      if (this.itemClicked?.id == habili.id) {
        // décoche les authorisations actives
        this.authorisations.forEach(e => (e.value = false));
        // décoche les actions actives
        this.actions.forEach(e => (e.value = false));
      }
    }
  }

  /**
   * ajoute ou suprime les habilitations d'une liste on fonction de l'etat initial
   *
   * @param habilis la liste a ajouter ou supprimer
   */
  private addOrRemoveHabiliList(habilis) {
    habilis
      .map(e => {
        this.initialHabilitations.map(v => v.id).includes(e.id) ? (e.value = true) : (e.value = false);
        return e;
      })
      .forEach(e => this.addOrRemoveOneHabili(e));
  }

  /**
   * clique sur annuler, annule toutes les modifications en cours
   */
  annuler() {
    initialiseHabilitation(this.tree, this.initialHabilitations);
    this.currentHabilitations = [];
    this.initialHabilitations.forEach(e => {
      this.currentHabilitations[e.id] = JSON.parse(JSON.stringify(e));
    });
    this.dataChanged = false;
    this.initButton = false;
    this.habilitationClicked(this.itemClicked);
  }

  /**
   * dupliquer un profile
   */
  dupliquerProfils() {
    const profileToDuplicate = this.profileActive.profile + ' - ' + this.profileActive.libelleProfile;
    const modalRef = this.modalService.open(PopupDuplicateProfileComponent, { modalDialogClass: 'modal-formulaire' });
    modalRef.componentInstance.profile = profileToDuplicate;
    modalRef.result
      .then(reason => {
        const newProfile = {} as Profile;
        newProfile.profile = reason.nouveauCodeProfile;
        newProfile.libelleProfile = reason.nouveauLibelleProfile;
        newProfile.habilitations = this.initialHabilitations.map(e => {
          return { id: e.id, parentId: e.parentId };
        });

        this.subscriptions.push(
          this.apiProfileService.createProfile(newProfile).subscribe({
          next: ({ data }) => {
            this.profiles.push((data as any).createProfile);
            this.noteService.show({
              title: 'Le profile "' + (data as any).createProfile.profile + '" a été crée avec succès',
              classname: 'note-confirmation',
              category: ToastCategoryEnum.SUCCESS,
            });
          },
            error: error => {
              console.error(error);
              this.noteService.show({
                title: `Echec de la sauvegarde : ${error.message} `,
                classname: 'note-erreur',
                delay: 300000,
                category: ToastCategoryEnum.ERROR,
              });
            },
            })
          );
        })
        .catch(e => console.error(e));
  }

  save() {
    const newProfile = {} as Profile;
    newProfile.profile = this.profileActive.profile;
    newProfile.libelleProfile = this.profileActive.libelleProfile;
    newProfile.habilitations = this.currentHabilitations.map(e => {
      return { id: e.id, parentId: e.parentId };
    });

    this.subscriptions.push(
      this.apiProfileService.saveProfile(newProfile).subscribe({
      next: ({ data }) => {
        this.noteService.show({
          title: 'La sauvegarde est effectuée avec succès',
          classname: 'note-confirmation',
          category: ToastCategoryEnum.SUCCESS,
        });
        this.dataChanged = false;
        this.initButton = false;
        this.initialHabilitations = JSON.parse(JSON.stringify(this.currentHabilitations.filter(e => e != null)));
        //this.profiles.push({profile: newProfile.profile, libelleProfile: newProfile.libelleProfile} as Profile)
      },
        error: error => {
          console.error(error);
          this.noteService.show({
            title: `Echec de la sauvegarde : ${error.message} `,
            classname: 'note-erreur',
            delay: 300000,
            category: ToastCategoryEnum.ERROR,
          });
        },
        })
      );
  }
}

/**
 * contruit un tree a partir de la liste des habilitations
 * @param data liste des habilitations
 * @param habili
 * @returns le tree reconstituer
 */
const unflatten = (data, habili) => {
  const tree = data
    .sort((a, b) => a.id - b.id)
    .reduce((a, e) => {
      habili.includes(e.id) ? (e.value = true) : (e.value = false);
      a[e.id] = a[e.id] || e;
      a[e.parentId] = a[e.parentId] || {};
      const parent = a[e.parentId];
      parent.children = parent.children || [];
      parent.children.push(e);
      return a;
    }, {});
  return tree.null.children;
};

/**
 * initialise le tree avec les habilitation de chaque profile
 * @param tree le tree a initialiser
 * @param initial liste des habilitation ou boolean pour mettre tout a true ou false
 */
const initialiseHabilitation = (tree, initial) => {
  tree.forEach(e => {
    if (e.children && e.children.length > 0) {
      initialiseHabilitation(e.children, initial);
    } else if (Array.isArray(initial)) {
      initial.some(n => n.id == e.id) ? (e.value = true) : (e.value = false);
    } else {
      initial ? (e.value = true) : (e.value = false);
    }
  });
};
