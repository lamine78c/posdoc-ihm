package fr.acoss.posdoc.domain.fichier.primary;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.fichier.model.ExempFichier;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.produi.model.Produi;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FichierService {

  private final FichierPersistence fichierPersistence;
  private final ParametrePersistence parametrePersistence;

  public FichierService(final FichierPersistence fichierPersistence, final ParametrePersistence parametrePersistence) {
    this.fichierPersistence = fichierPersistence;
    this.parametrePersistence = parametrePersistence;
  }

  public Map<String, Integer> createFichiersWithExemplaire(final List<Fichier> fichiers) {
    List<Produi> produits = new ArrayList<>();
    List<Exemplaire> exemplaires = new ArrayList<>();

    fichiers.forEach(fichier -> {
      fichier.setTypeMultif("-");
      if (fichier.getExemplaires() != null && !fichier.getExemplaires().isEmpty()) {
        createProduitsEtExemplaires(fichier, produits, exemplaires);
      }
    });

    checkFichiersExistants(fichiers);

    return fichierPersistence.createFichierWithExemplaire(fichiers, produits, exemplaires);
  }

  // Crée les produits et leurs exemplaires associés
  private void createProduitsEtExemplaires(Fichier fichier, List<Produi> produits, List<Exemplaire> exemplaires) {
    var groupedByGamme = fichier.getExemplaires()
            .stream()
            .collect(Collectors.groupingBy(ExempFichier::getCodeGamme));

    groupedByGamme.forEach((gamme, exempList) -> {
      produits.add(createProduitAvecGamme(fichier, gamme));
      addExemplairesPourGamme(fichier, gamme, exempList, exemplaires);
    });
  }

  // Crée un produit associé à une gamme
  private Produi createProduitAvecGamme(Fichier fichier, String gamme) {
    Produi produit = new Produi();
    produit.setCodenv(fichier.getCodeEnv());
    produit.setCodorg(fichier.getCodeOrg());
    produit.setCodapp(fichier.getCodeApp());
    produit.setCodcom(fichier.getCodeCom());
    produit.setCodfic(fichier.getCodeFich());
    produit.setCodgam(gamme);
    produit.setProact(true);
    return produit;
  }

  // Ajoute les exemplaires pour une gamme donnée
  private void addExemplairesPourGamme(Fichier fichier, String gamme, List<ExempFichier> exempList, List<Exemplaire> exemplaires) {
    int[] numexe = {1};
    exempList.forEach(exempFichier -> {
      Exemplaire ex = new Exemplaire();
      ex.setCodenv(fichier.getCodeEnv());
      ex.setCodorg(fichier.getCodeOrg());
      ex.setCodapp(fichier.getCodeApp());
      ex.setCodcom(fichier.getCodeCom());
      ex.setCodfic(fichier.getCodeFich());
      ex.setCodgam(gamme);
      ex.setCodsit(exempFichier.getCodeSite());
      ex.setNumexe(String.valueOf(numexe[0]));
      ex.setCodres(exempFichier.getCodeRessource());
      ex.setExeact(true);
      ex.setNbrexe(1);
      exemplaires.add(ex);
      numexe[0]++;
    });
  }

  // Vérifie l'existence des fichiers dans la BDD
  private void checkFichiersExistants(List<Fichier> fichiers) {
    var found = fichierPersistence.checkIfExistInList(fichiers);
    if (found != null && !found.isEmpty()) {
      var codes = found.stream()
              .map(Fichier::idToString)
              .collect(Collectors.joining("\n", "[", "]"));
      throw new AlreadyExistingElement("Fichier", codes);
    }
  }


  public List<Fichier> setNewImprimeToFichiers(final List<Fichier> fichiers) {
    return fichierPersistence.setNewImprimeToFichiers(fichiers);
  }

  public Fichier setNewImprimeToFichier(final Fichier fichier) {
    return fichierPersistence.setNewImprimeToFichier(fichier);
  }

  public List<Fichier> updateAll(final List<Fichier> fichiers) {
    return fichierPersistence.updateAll(fichiers);
  }

  public void deleteFichiers(List<Fichier> fichiers) {

    fichiers.forEach(e -> {
      var hasDependancy = fichierPersistence.findFichierById(e);
      if(hasDependancy)
          throw new StileExistingElement("Fichier", e.idToString(),  "Produit");
    });

    fichierPersistence.deleteAll(fichiers);

  }

  public List<String> getOrgByEnvAppComFics(SearchOrgByEnvAppComFicsQuery query) {
    List<String> orgsInFichiers = fichierPersistence.getOrgByEnvAppComFics(query);
    String oguorg = parametrePersistence.getValueByCode(ParamsUtils.OGUORG);
    return orgsInFichiers.stream().distinct().filter(e -> !e.equals(oguorg)).collect(Collectors.toList());
  }
}