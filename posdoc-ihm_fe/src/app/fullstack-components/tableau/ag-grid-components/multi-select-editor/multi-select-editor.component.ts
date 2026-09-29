import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { EditorService } from '../../services/editor.service';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ListeDeroulanteService } from '@app/fullstack-components/liste-deroulante/services/liste-deroulante.service';
import { ONE, ZERO } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-multi-select-editor',
  templateUrl: './multi-select-editor.component.html',
  styleUrls: ['./multi-select-editor.component.scss'],
  standalone: false,
})
export class MultiSelectEditorComponent implements ICellRendererAngularComp, OnDestroy {
  /**
   * Désactive le formulaire si true
   * Optionnel, peut être laissé à vide pour activer le formulaire
   */
  @Input() disabled = false;
  // DropDown
  @ViewChild('dropdownRef', { static: false, read: NgbDropdown }) dropdown: NgbDropdown;
  // Envoyer les champs selectionnés au composant parent
  @Output() changeEvent = new EventEmitter<any>();
  // Index pour éviter des duplications d'id/for
  formIndex: number;
  // Statut de l'édition
  isEditing: boolean;
  // Id de la cellule
  cellId: string;
  //parametre de la cellule
  params: any;
  // Group du formulaire réactif contenant l'ensemble des valeurs
  // Format : group({ 'Groupe 1': group({ 'Option 1': }) })
  form: FormGroup = this.fb.group({});
  // affichage des erreurs
  displayErrorsFn;
  // Form pour le bouton select all
  formSelectAll: FormGroup = new FormGroup({});
  subscriptions: Subscription[] = [];
  // Contenu à afficher dans la select en fonction des choix
  contentToDisplay: string;
  // Initialise un objet pour stocker les états de réduction
  isCollapsed: { [key: string]: boolean } = {};

  constructor(
    private readonly fb: FormBuilder,
    private readonly listeDeroulanteService: ListeDeroulanteService,
    private readonly editorService: EditorService
  ) {}

  agInit(params: any): void {
    this.params = params;
    this.cellId = params.column['colId'];

    const isTotalRow = !!params.node.rowPinned;
    // Vérifie si la cellule est en edition
    this.isEditing = this.editorService.getIsEditing(this.params);

    // Pas éditable si ligne total ou pas de clef de formulaire
    if (this.params.formKey && !isTotalRow && this.isEditing && !params.data.lockEdition) {
      const validators = this.params.validators ?? [];
      this.form = this.fb.group({
        [this.params.formKey]: [this.params.value, validators],
      });
      // Affiche les erreurs
      this.editorService.displayErrorsAfterFormInit(this.form, this.cellId, this.params);
      // Dans le cas d'une nouvelle ligne
      if (this.params.newRowAdded) {
        // Écoute l'évènement rowDataUpdated afin d'afficher les erreurs
        // Notamment utile si l'utilisateur essaie d'ajouter une ligne vide
        this.displayErrorsFn = this.displayErrors.bind(this);
        this.params.api.addEventListener('rowDataUpdated', this.displayErrorsFn);
      }
    } else {
      this.isEditing = false;
    }
    this.contentToDisplay = this.params.value;
    this.modelUpddated();

    this.closeAllCollapse();
  }

  /**
   * Initialise 'isCollapsed' pour chaque élément  pour les mettre en mode fermeture
   */
  closeAllCollapse(): void {
    Object.keys(this.form.controls).forEach((element, index) => {
      this.isCollapsed[index] = true;
    });
  }

  /**********************/
  /** AFFICHAGE ERREURS */
  /**********************/
  /**
   * Affiche les erreurs du formulaire si il y en a
   */
  displayErrors(): void {
    this.form.markAsTouched();
  }

  filterChanged(changes) {
    let items = changes.map(e => e.title).map(e => (e === 'vide' ? null : e));
    items = items.length > ZERO ? items : null;
    this.params.value = items.length > ZERO ? items[ZERO] : null;
    this.params.data[''] = items.length > ZERO ? items[ZERO] : null;
  }

  setNewValue(value): void {
    this.params.setValue(value);
    this.contentToDisplay = value;
    this.dropdown.close();
    // Enregistre le fait que cette ligne a été modifiée (utilisé pour la validation asynchrone)
    this.params.node.updated = true;
    // Met à jour la validité de la cellule en fonction du formulaire
    this.params.node.formErrors.set(this.cellId, false);
  }

  modelUpddated() {
    // on passe l'index du selectAll au formulaire
    this.formIndex = this.params.column.instanceId;

    // données de formulaire
    let data;

    // si values existe, liste hierachique
    if (this.params.values != null || this.params.selectData != null) {
      // liste total des organisque existatnt, avec leur régions
      let allOrganismes = this.params.values;

      // si les données brut n'existe pas, on s'inscrit pour les recevoir
      if (!!!this.params.values.length) {
        this.subscriptions.push(this.params.selectData.subscribe(e => {
          allOrganismes = e;
          data = this.getDataWithElmWithoutParent(allOrganismes);
          this.initForm(data);
          this.closeAllCollapse();
        }));
      }
      data = this.getDataWithElmWithoutParent(allOrganismes);
    }
    this.initForm(data);
  }

  isDisable(form: FormGroup): boolean {
    return Object.keys(form.controls).length == ONE;
  }

  ngOnInit(): void {
    // Formulaire pour le select all
    this.formSelectAll = this.fb.group({
      selectAll: false,
    });

    // Met à jour les valeurs lorsque 'Tout sélectionner / Tout désélectionner' est coché
    this.subscriptions.push(
      this.formSelectAll.valueChanges.subscribe(() => {
        this.listeDeroulanteService.selectAll(this.formSelectAll, this.form, true);
      })
    );

    // Met à jour la checkbox selectAll du formulaire groupForm lorsque des valeurs sont sélectionnées
    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        this.listeDeroulanteService.shouldSelectAll(this.formSelectAll, this.form);
      })
    );

    // initialisation du filtre
    this.changeEvent.emit([]);
  }

  getDataWithElmWithoutParent(allOrganismes: any): any[] {
    let data =
      allOrganismes &&
      allOrganismes
        .map(e => e.code)
        .filter((x, i, a) => a.indexOf(x) == i)
        .map(e => ({ organisme: e, region: allOrganismes.find(n => n.code == e)?.codeRegion }))
        .reduce((entryMap, e) => entryMap.set(e.region, [...(entryMap.get(e.region) || [].map(i => i?.organisme)), e]), new Map());
    data.delete(undefined);

    const rawData = [...data].map(([parent, localChildren]) => {
      const children = localChildren.map(u => u.organisme);
      return { parent, children };
    });

    // get data with parent
    data = rawData.filter(e => e.parent != '' && e.parent != null);

    // get datat without parent
    const dataWithoutParent = rawData
      .filter(e => e.parent == '' || e.parent == null)
      .map(e => e.children.map(u => ({ parent: u, children: [u] })))
      .flat();

    data.push(...dataWithoutParent);

    return data;
  }

  initForm(data: any): void {
    // si le filtre est activé, on coche les checkbox du formulaire
    // let isFilter =  this.params.api.getColumnFilterInstance(this.params.column.colId)?.isFilterActive();
    let isFilter = false;
    this.params.api.getColumnFilterInstance(this.params.column.colId).then(filterInstance => {
      isFilter = filterInstance!.isFilterActive();
    });

    const map = new Map();
    data.forEach(e => {
      const fg = this.fb.group({});
      e.children?.forEach(n => {
        fg.addControl(n, new FormControl(isFilter, null));
      });
      map.set(e.parent, fg);
    });

    const obj = Object.fromEntries(map);
    this.form = this.fb.group(obj);
  }

  /**
   * Appelé lorsque la dropdown est ouverte/fermée
   */
  openChange(isOpened: boolean): void {
    if (!isOpened) {
      this.form.markAsTouched();
    }
  }

  /**
   * Toggle la dropdown
   */
  toggleDropdown(): void {
    this.dropdown.toggle();
  }

  ngOnDestroy(): void {
    if (this.params?.api && this.displayErrorsFn) {
      this.params.api.removeEventListener('rowDataUpdated', this.displayErrorsFn);
    }
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  refresh(): boolean {
    return false;
  }

  isTouchedAndEmpty(): boolean {
    return this.form.touched && !!!this.contentToDisplay;
  }
}
