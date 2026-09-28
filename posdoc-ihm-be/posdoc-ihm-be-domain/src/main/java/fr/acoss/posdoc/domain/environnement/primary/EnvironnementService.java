package fr.acoss.posdoc.domain.environnement.primary;

import fr.acoss.posdoc.domain.application.secondary.ApplicationPersistence;
import fr.acoss.posdoc.domain.environnement.model.Environnement;
import fr.acoss.posdoc.domain.environnement.secondary.EnvironnementPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.environnement.validators.EnvironnementValidators.codeValidator;
import static fr.acoss.posdoc.domain.environnement.validators.EnvironnementValidators.libelleValidator;

public class EnvironnementService {

  private static final String ENVIRONNEMENT = "Environnement";
  private static final String APPLICATION = "Application";
  private final EnvironnementPersistence environnementPersistence;

  private final ApplicationPersistence applicationPersistence;

  public EnvironnementService(
          final EnvironnementPersistence environnementPersistence,
          final ApplicationPersistence applicationPersistence
  ) {
    this.environnementPersistence = environnementPersistence;
    this.applicationPersistence = applicationPersistence;
  }

  public Environnement createEnvironnement(final Environnement environnement) {

    //Un seul caractère
    codeValidator().validate(environnement.getCode());
    //Entre 0 et 50 caractères
    libelleValidator().validate(environnement.getLibelle());

    //Vérification que le code n'existe pas
    if (environnementPersistence.exists(environnement.getCode())) {
      throw new AlreadyExistingElement(ENVIRONNEMENT, environnement.getCode());
    }

    return environnementPersistence.create(environnement);
  }

  public Environnement updateEnvironnement(final Environnement environnement) {

    //Un seul caractère
    codeValidator().validate(environnement.getCode());
    //Entre 0 et 50 caractères
    libelleValidator().validate(environnement.getLibelle());

    if (!environnementPersistence.exists(environnement.getCode())) {
      throw new ElementNotFoundException(ENVIRONNEMENT, environnement.getCode());
    }

    return environnementPersistence.create(environnement);
  }

  public void deleteEnvironnement(final String code) {
    environnementPersistence.delete(code);
  }

  public void deleteEnvironnements(List<String> environnementCodes) {
    // vérification dépendance Application
    List<String> listApp = applicationPersistence.environnementsExistsInApplications(environnementCodes);
    if (!listApp.isEmpty()) {
      throw new StileExistingElement(ENVIRONNEMENT, environnementCodes, APPLICATION);
    }
    environnementPersistence.deleteAll(environnementCodes);
  }

}
