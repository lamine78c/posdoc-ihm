package fr.acoss.posdoc.domain.gammes.primary;

import fr.acoss.posdoc.domain.gammes.model.Gamme;
import fr.acoss.posdoc.domain.gammes.secondary.GammePersistence;

import fr.acoss.posdoc.domain.produi.secondary.ProduiPersistence;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;
import static fr.acoss.posdoc.domain.gammes.validators.GammeValidators.*;


public class GammeService {

  public static final String GAMME = "Gamme";
  public static final String RESSOURCE = "Ressource";
  public static final String PRODUIT = "Produit";
  public static final String RESSOURCE_PRODUIT = "Ressource et Produit";
  private final GammePersistence gammePersistence;
  private final RessourcePersistence ressourcesPersistence;
  private final ProduiPersistence produiPersistence;

  public GammeService(
          final GammePersistence gammePersistence,
          final RessourcePersistence ressourcesPersistence,
          final ProduiPersistence produiPersistence
  ) {
    this.gammePersistence = gammePersistence;
    this.ressourcesPersistence = ressourcesPersistence;
    this.produiPersistence = produiPersistence;
  }

  public Gamme createGamme(final Gamme gamme) {

    codeValidator().validate(gamme.getCode());
    libelleValidator().validate(gamme.getLibelle());
    if(gamme.getCodeVerrou()!=null) {
      codeVerrouValidator().validate(gamme.getCodeVerrou());
    }

    if (gammePersistence.exists(gamme.getCode())) {
      throw new AlreadyExistingElement(GAMME, gamme.getCode());
    }

    return gammePersistence.create(gamme);
  }

  public Gamme updateGamme(final Gamme gamme) {

    codeValidator().validate(gamme.getCode());
    libelleValidator().validate(gamme.getLibelle());
    if(gamme.getCodeVerrou()!=null) {
      codeVerrouValidator().validate(gamme.getCodeVerrou());
    }

    if (!gammePersistence.exists(gamme.getCode())) {
      throw new ElementNotFoundException(GAMME, gamme.getCode());
    }

    return gammePersistence.create(gamme);
  }

  public void deleteGamme(final String code) {
    gammePersistence.delete(code);
  }


  public List<Gamme> createGammes (List<Gamme> gammes) {

    gammes.stream().forEach(e -> {

      codeValidator().validate(e.getCode());
      libelleValidator().validate(e.getLibelle());
      if(e.getCodeVerrou()!=null) {
        codeVerrouValidator().validate(e.getCodeVerrou());
      }

      if (gammePersistence.exists(e.getCode())) {
        throw new AlreadyExistingElement(GAMME, e.getCode());
      }
    });

    return gammePersistence.updateAll(gammes);
  }

  public List<Gamme> updateGammes(List<Gamme> gammes) {

    gammes.stream().forEach(e -> {

      codeValidator().validate(e.getCode());
      libelleValidator().validate(e.getLibelle());
      if(e.getCodeVerrou()!=null) {
        codeVerrouValidator().validate(e.getCodeVerrou());
      }

      if (!gammePersistence.exists(e.getCode())) {
        throw new ElementNotFoundException(GAMME, e.getCode());
      }
    });
    return gammePersistence.updateAll(gammes);
  }

  public void deleteGammes(List<String> gammeCodes) {
    // vérification dépendance Ressource
    List<String> listRes = ressourcesPersistence.gammesExistsInRessources(gammeCodes);
    // vérification dépendance Produit
    List<String> listPro = produiPersistence.gammesExistsInProduits(gammeCodes);

    if (!listRes.isEmpty() && !listPro.isEmpty()) {
      // Les deux listes ne sont pas vides
      throw new StileExistingElement(GAMME, gammeCodes, RESSOURCE_PRODUIT);
    } else if (!listRes.isEmpty()) {
      // Seule la liste des ressource n'est pas vide
      throw new StileExistingElement(GAMME, gammeCodes, RESSOURCE);
    } else if (!listPro.isEmpty()) {
      // Seule la liste des produits n'est pas vide
      throw new StileExistingElement(GAMME, gammeCodes, PRODUIT);
    }
    gammePersistence.deleteAll(gammeCodes);
  }

}
