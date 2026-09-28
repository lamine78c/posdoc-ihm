package fr.acoss.posdoc.domain.exemplaire.primary;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByResource;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireComposite;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireExistsQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindOrganismesByExemplaireQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindOrganismesToCompleteInput;
import fr.acoss.posdoc.domain.exemplaire.model.RessourceExistForOrganismeSiteQuery;
import fr.acoss.posdoc.domain.exemplaire.model.query.ExemplaireByRessourceQuery;
import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.primary.FichierService;
import fr.acoss.posdoc.domain.parametre.distribution.model.RessourcePayload;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.produi.model.Produi;
import fr.acoss.posdoc.domain.produi.secondary.ProduiPersistence;
import fr.acoss.posdoc.domain.ressource.model.FindOrganismesByRessourceQuery;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ExemplaireService {

  private final ExemplairePersistence exemplairePersistence;
  private final ProduiPersistence produiPersistence;
  private final RessourcePersistence ressourcePersistence;
  private final ParametrePersistence parametrePersistence;
  private final FichierService fichierService;

  public ExemplaireService(
          final ExemplairePersistence exemplairePersistence,
          final ProduiPersistence produiPersistence,
          final RessourcePersistence ressourcePersistence,
          final ParametrePersistence parametrePersistence,
          FichierService fichierService) {
    this.exemplairePersistence = exemplairePersistence;
    this.produiPersistence = produiPersistence;
    this.ressourcePersistence = ressourcePersistence;
    this.parametrePersistence = parametrePersistence;
    this.fichierService = fichierService;
  }

  public Exemplaire createExemplaire(final Exemplaire exemplaire) {
    if (!shouldCreateExemplaire(exemplaire, new ArrayList<>())) {
      throw new CustomExceptionMessage("L'exemplaire [" + exemplaire.getCodenv() + "-" + exemplaire.getCodorg() + "-" + exemplaire.getCodapp()
              + "-" + exemplaire.getCodcom() + "-" + exemplaire.getCodfic()
              + "-" + exemplaire.getCodgam() + "-" + exemplaire.getCodsit() + "-" + exemplaire.getCodres() + "] ne peut pas être ajouté");
    }
    // Crée le produit s'il n'existe pas
    this.createProductIfNotExist(exemplaire);
    // incrémenter l'attribut Numexe
    if (exemplaire.getNumexe() == null) {
      int maxNumExe = this.exemplairePersistence.findExemplairesByCriteres(
        exemplaire.getCodenv(),
        exemplaire.getCodorg(),
        exemplaire.getCodapp(),
        exemplaire.getCodcom(),
        exemplaire.getCodfic(),
        exemplaire.getCodgam()
      ).stream().mapToInt(ex -> Integer.parseInt(ex.getNumexe())).max().orElse(0);
      exemplaire.setNumexe(String.format("%02d", ++maxNumExe));
    }
    return exemplairePersistence.create(exemplaire);
  }

  public List<Exemplaire> createExemplaires(List<Exemplaire> exemplaires) {
    List<Exemplaire> exemplairesToCreate = new ArrayList<>();
    IntStream.range(0, exemplaires.size()).forEach(i -> {
      Exemplaire e = exemplaires.get(i);
      // vérifier les cohérences, les doublons, les ressources, etc...
      if (shouldCreateExemplaire(e, exemplairesToCreate)) {
        // Crée le produit s'il n'existe pas
        this.createProductIfNotExist(e);
        // incrémenter l'attribut Numexe
        List<Exemplaire> existingExemplaires = exemplairePersistence
                .findExemplairesByCriteres(e.getCodenv(), e.getCodorg(), e.getCodapp(), e.getCodcom(), e.getCodfic(), e.getCodgam());
        // check numexe pour l'ajout en masse des ressources
        existingExemplaires.addAll(exemplairesToCreate.stream().filter( etc ->
                etc.getCodenv().equals(e.getCodenv()) &&
                        etc.getCodorg().equals(e.getCodorg()) &&
                        etc.getCodapp().equals(e.getCodapp()) &&
                        etc.getCodcom().equals(e.getCodcom()) &&
                        etc.getCodfic().equals(e.getCodfic()) &&
                        etc.getCodgam().equals(e.getCodgam())
        ).collect(Collectors.toList()));
        int maxNumExe = existingExemplaires
                .stream()
                .mapToInt(ex -> Integer.parseInt(ex.getNumexe()))
                .max()
                .orElse(0);
        e.setNumexe(String.format("%02d", ++maxNumExe));
        exemplairesToCreate.add(e);
      }
    });
    return exemplairePersistence.updateAll(exemplairesToCreate);
  }

  /**
   * Modifier le site, la ressource, le destinataire et l'état
   * Contrôle sur la ressource (ressource)
   * Contrôle sur l'état (produit)
   */
  public Exemplaire updateExemplaire(final Exemplaire exemplaire) {
    if (exemplaire.getNumexe() == null) {
      // Récupère automatiquement le numexe
      ExemplaireComposite id = new ExemplaireComposite(
              exemplaire.getCodenv(),
              exemplaire.getCodorg(),
              exemplaire.getCodapp(),
              exemplaire.getCodcom(),
              exemplaire.getCodfic(),
              exemplaire.getCodgam(),
              ""
      );
      exemplaire.setNumexe(exemplairePersistence.getNumexeFromExemplaire(id, exemplaire.getCodres(), exemplaire.getCodsit()));
    }

    if (!exemplairePersistence.exists(exemplaire.getCodenv(), exemplaire.getCodorg(),exemplaire.getCodapp() ,exemplaire.getCodcom(),exemplaire.getCodfic(),exemplaire.getCodgam(),exemplaire.getNumexe() )) {
      throw new ElementNotFoundException("Exemplaire", exemplaire.getNumexe());
    }

    if (!ressourcePersistence.isRessourceExist(getRessourceExistForOrganismeSiteQuery(exemplaire))) {
      throw new CustomExceptionMessage("Le site ["+ exemplaire.getCodsit() +"] n'existe pas pour la ressource [" + exemplaire.getCodenv() + "-" + exemplaire.getCodorg() + "-"
              + exemplaire.getCodapp() + "-" + exemplaire.getCodgam() + "-" + exemplaire.getCodres() +"]");
    }

    if (exemplairePersistence.exemplaireExists(getExemplaireExistsQuery(exemplaire))) {
      throw new AlreadyExistingElement("Exemplaire", exemplaire.getCodenv()+'-'+exemplaire.getCodorg()+'-'+exemplaire.getCodapp()+'-'+ exemplaire.getCodcom()+'-'+exemplaire.getCodfic()+'-'+exemplaire.getCodgam()+'-'+exemplaire.getCodsit()+'-'+exemplaire.getCodres()+'-'+exemplaire.getNumexe());
    }

    Exemplaire result = exemplairePersistence.update(exemplaire);

    changeProduiProActFromExemplaire(exemplaire);

    return result;
  }

  /**
   * Modification en masse le site et l'etat
   */
  public List<Exemplaire> updateExemplaires(List<Exemplaire> exemplaires) {
    List<Exemplaire> exemplairesToUpdate = new ArrayList<>();
    exemplaires.forEach(exemplaire -> {
      updateExemplaire(exemplaire);
      exemplairesToUpdate.add(exemplaire);
    });
    return exemplairesToUpdate;
  }

  /**
   * Modifier en masse des gammes, ressources et destinataires
   */
  public List<Exemplaire> updateMasseExemplaires(RessourcePayload ressourcePayload, List<Exemplaire> exemplaires) {
    List<Exemplaire> toDelete = new ArrayList<>();
    List<Exemplaire> exemplairesToCreate = new ArrayList<>();

    for (Exemplaire exemplaire : exemplaires) {
      Exemplaire originalExemplaire = cloneExemplaire(exemplaire);
      updateExemplaireFromPayload(exemplaire, ressourcePayload);
      // lorsqu'on change la gamme, il faut supprimer exemplaire et le recréer
      if (shouldCreateExemplaire(exemplaire, exemplairesToCreate)) {
        toDelete.add(originalExemplaire);
        exemplairesToCreate.add(exemplaire);
      }
    }

    deleteExemplaires(toDelete);
    return createExemplaires(exemplairesToCreate);
  }

  public void deleteExemplaire(ExemplaireComposite id, final String codres, final String codsit ) {
    if (id.getNumexe() == null) {
      id.setNumexe(exemplairePersistence.getNumexeFromExemplaire(id, codres, codsit));
    }

    exemplairePersistence.delete(id.getCodenv(), id.getCodorg(), id.getCodapp(), id.getCodcom(), id.getCodfic(), id.getCodgam(), id.getNumexe());
    // Supprime le produit non attaché
    Produi product = buildProduiByExemplaireCompositeId(id);
    this.removeAllUnattachedProducts(product);
  }


  public void deleteExemplaires(List<Exemplaire> exemplaires) {
    List<ExemplaireComposite> ids = exemplaires.stream().map(e -> {
      ExemplaireComposite id = new ExemplaireComposite(e.getCodenv(), e.getCodorg(), e.getCodapp(), e.getCodcom(), e.getCodfic(), e.getCodgam(), e.getNumexe());
      if (id.getNumexe() == null) {
        id.setNumexe(exemplairePersistence.getNumexeFromExemplaire(id, e.getCodres(), e.getCodsit()));
      }
      return id;
    }).collect(Collectors.toList());

    exemplairePersistence.deleteAll(ids);
    // Supprime tous les produits non attachés
    ids.forEach(id -> {
      Produi product = buildProduiByExemplaireCompositeId(id);
      this.removeAllUnattachedProducts(product);
    });
  }

  private void changeProduiProActFromExemplaire(Exemplaire exemplaire) {
    Produi product = buildProduiByExemplaire(exemplaire);
    // Désactiver le produit si désactivation de tous les exemplaires
    // Activer le produit si au moins un exemplaire activé
    if (
            (exemplaire.getExeact().equals(false) && exemplairePersistence.isAllExemplaireInProduitDesactives(product))
                    || exemplaire.getExeact().equals(true)
    ) {
      produiPersistence.update(product);
    }
  }

  private void createProductIfNotExist(Exemplaire exemplaire) {
    Produi produit = buildProduiByExemplaire(exemplaire);
    produit.setProact(true);
    if (!this.produiPersistence.exists(produit)) {
      this.produiPersistence.create(produit);
    }
  }

  private RessourceExistForOrganismeSiteQuery getRessourceExistForOrganismeSiteQuery(final Exemplaire exemplaire) {
    return new RessourceExistForOrganismeSiteQuery(
            exemplaire.getCodenv(),
            exemplaire.getCodorg(),
            exemplaire.getCodapp(),
            exemplaire.getCodsit(),
            exemplaire.getCodgam(),
            exemplaire.getCodres(),
            parametrePersistence.getValueByCode(ParamsUtils.OGUORG)
    );
  }

  private Produi buildProduiByExemplaire(Exemplaire exemplaire) {
    return Produi.builder()
            .codenv(exemplaire.getCodenv())
            .codorg(exemplaire.getCodorg())
            .codapp(exemplaire.getCodapp())
            .codcom(exemplaire.getCodcom())
            .codfic(exemplaire.getCodfic())
            .codgam(exemplaire.getCodgam())
            .proact(exemplaire.getExeact())
            .build();
  }

  private Produi buildProduiByExemplaireCompositeId(ExemplaireComposite id) {
    return Produi.builder()
            .codenv(id.getCodenv())
            .codorg(id.getCodorg())
            .codapp(id.getCodapp())
            .codcom(id.getCodcom())
            .codfic(id.getCodfic())
            .codgam(id.getCodgam())
            .build();
  }

  /**
   * Crée une copie d'un exemplaire pour conserver son état original.
   */
  private Exemplaire cloneExemplaire(Exemplaire exemplaire) {
    return new Exemplaire(
            exemplaire.getCodenv(),
            exemplaire.getCodorg(),
            exemplaire.getCodapp(),
            exemplaire.getCodcom(),
            exemplaire.getCodfic(),
            exemplaire.getCodgam(),
            exemplaire.getNumexe(),
            exemplaire.getCodsit(),
            exemplaire.getCodres(),
            exemplaire.getCoddes(),
            exemplaire.getNbrexe(),
            exemplaire.getExeact()
    );
  }

  /**
   * Met à jour un exemplaire avec les valeurs du payload.
   */
  private void updateExemplaireFromPayload(Exemplaire exemplaire, RessourcePayload payload) {
    exemplaire.setCodgam(payload.getCodgam());
    exemplaire.setCodres(payload.getCodres());
    exemplaire.setCoddes(payload.getCoddes());
  }

  /**
   * Vérifie si l'exemplaire doit être créé en s'assurant qu'il n'existe pas déjà.
   * Contrôle sur le fichier
   * Contrôle sur la ressource
   * Controle les doublons dans la liste à créer
   */
  private boolean shouldCreateExemplaire(Exemplaire exemplaire, List<Exemplaire> exemplairesToCreate) {
    List<String> orgsFic = getOrganismesByFichierFromExemplaire(exemplaire);
    return exemplairesToCreate.stream().noneMatch(etc -> areExemplairesEqual(etc, exemplaire))
            && !exemplairePersistence.ressourceExists(getExemplaireExistsQuery(exemplaire))
            && orgsFic.contains(exemplaire.getCodorg())
            && ressourcePersistence.isRessourceExistForOrganismeSite(getRessourceExistForOrganismeSiteQuery(exemplaire))
            ;
  }

  private List<String> getOrganismesByFichierFromExemplaire(final Exemplaire query) {
    SearchOrgByEnvAppComFicsQuery searchOrgByEnvAppComFicsQuery = new SearchOrgByEnvAppComFicsQuery();
    searchOrgByEnvAppComFicsQuery.setCodeEnv(query.getCodenv());
    searchOrgByEnvAppComFicsQuery.setCodeApp(query.getCodapp());
    searchOrgByEnvAppComFicsQuery.setCodeCom(query.getCodcom());
    searchOrgByEnvAppComFicsQuery.setCodesFic(List.of(query.getCodfic()));
    return fichierService.getOrgByEnvAppComFics(searchOrgByEnvAppComFicsQuery);
  }

  /**
   * Compare deux exemplaires sur les champs clés.
   */
  private boolean areExemplairesEqual(Exemplaire e1, Exemplaire e2) {
    return e1.getCodenv().equals(e2.getCodenv()) &&
            e1.getCodorg().equals(e2.getCodorg()) &&
            e1.getCodapp().equals(e2.getCodapp()) &&
            e1.getCodcom().equals(e2.getCodcom()) &&
            e1.getCodfic().equals(e2.getCodfic()) &&
            e1.getCodgam().equals(e2.getCodgam()) &&
            e1.getCodsit().equals(e2.getCodsit()) &&
            e1.getCodres().equals(e2.getCodres());
  }

  private void removeAllUnattachedProducts(final Produi product) {
    if (this.produiPersistence.exists(product)) {
      if (Boolean.FALSE.equals(this.exemplairePersistence.isProductAttachedToExemplaire(product))) {
        // je supprime le produit s'il n'a plus des exemplaires attachés
        this.produiPersistence.delete(product);
      }
      else if (this.exemplairePersistence.isAllExemplaireInProduitDesactives(product) ) {
        // je désactive le produit si tous les exemplaires du produit sont désactivés
        product.setProact(false);
        this.produiPersistence.update(product);
      }
    }
  }

  private ExemplaireExistsQuery getExemplaireExistsQuery(final Exemplaire e) {
    return new ExemplaireExistsQuery(
            e.getCodenv(),
            e.getCodorg(),
            e.getCodapp(),
            e.getCodcom(),
            e.getCodfic(),
            e.getCodgam(),
            e.getCodsit(),
            e.getCodres(),
            e.getNumexe()
    );
  }

  public List<ExemplaireByResource> getParametresEditionByRessource(ExemplaireByRessourceQuery query, String genericOrganisme) {
    List<ExemplaireByResource> exemplaires = this.exemplairePersistence.getParametresEditionByRessource(query, genericOrganisme);

    if (Boolean.FALSE.equals(query.getIsRessourcesAbsentes())) {
      return exemplaires.stream().filter(exemplaire ->
              exemplaire.getRessources().stream().anyMatch(resource -> Boolean.TRUE.equals(resource.getExemplaireExists()))
      ).collect(Collectors.toList());
    }
    return exemplaires;
  }

  public List<String> findExemplaireOrganismeToComplete(final FindOrganismesToCompleteInput query) {
    // get la liste orgs de ressource
    List<String> orgsRes = getOrganismesByRessource(query);
    // org générique
    String oguOrg = parametrePersistence.getValueByCode(ParamsUtils.OGUORG);
    // get la liste orgs de fichier
    List<String> orgsFic = getOrganismesByFichier(query);
    // get la liste orgs des exemplaires exists
    List<String> orgsExem = getOrganismesByExemplaires(query);
    // pour le cas d'une ressource non générique,
    if(!orgsRes.contains(oguOrg)) {
      // intersection
      orgsFic.retainAll(orgsRes);
    }
    // virer des orgs déjà crée
    orgsFic.removeIf(orgsExem::contains);
    return orgsFic;
  }

  private List<String> getOrganismesByExemplaires(final FindOrganismesToCompleteInput query) {
    FindOrganismesByExemplaireQuery findOrganismesByExemplaireQuery = new FindOrganismesByExemplaireQuery();
    findOrganismesByExemplaireQuery.setCodenv(query.getCodenv());
    findOrganismesByExemplaireQuery.setCodsit(query.getCodsit());
    findOrganismesByExemplaireQuery.setCodapp(query.getCodapp());
    findOrganismesByExemplaireQuery.setCodgam(query.getCodgam());
    findOrganismesByExemplaireQuery.setCodres(query.getCodres());
    findOrganismesByExemplaireQuery.setCodcom(query.getCodcom());
    findOrganismesByExemplaireQuery.setCodfic(query.getCodfic());
    return exemplairePersistence.findOrganismeCompleteByExemplaire(findOrganismesByExemplaireQuery);
  }

  private List<String> getOrganismesByFichier(final FindOrganismesToCompleteInput query) {
    SearchOrgByEnvAppComFicsQuery searchOrgByEnvAppComFicsQuery = new SearchOrgByEnvAppComFicsQuery();
    searchOrgByEnvAppComFicsQuery.setCodeEnv(query.getCodenv());
    searchOrgByEnvAppComFicsQuery.setCodeApp(query.getCodapp());
    searchOrgByEnvAppComFicsQuery.setCodeCom(query.getCodcom());
    searchOrgByEnvAppComFicsQuery.setCodesFic(List.of(query.getCodfic()));
    return fichierService.getOrgByEnvAppComFics(searchOrgByEnvAppComFicsQuery);
  }

  private List<String> getOrganismesByRessource(final FindOrganismesToCompleteInput query) {
    FindOrganismesByRessourceQuery findOrganismesByRessourceQuery = new FindOrganismesByRessourceQuery();
    findOrganismesByRessourceQuery.setCodenv(query.getCodenv());
    findOrganismesByRessourceQuery.setCodsit(query.getCodsit());
    findOrganismesByRessourceQuery.setCodapp(query.getCodapp());
    findOrganismesByRessourceQuery.setCodgam(query.getCodgam());
    findOrganismesByRessourceQuery.setCodres(query.getCodres());
    findOrganismesByRessourceQuery.setIsadmin(query.getIsadmin());
    return ressourcePersistence.findOrganismesByRessource(findOrganismesByRessourceQuery);
  }

}
