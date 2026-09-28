package fr.acoss.posdoc.domain.parametre.distribution.primary;

import fr.acoss.posdoc.domain.parametre.distribution.model.ParametreDistribution;
import fr.acoss.posdoc.domain.parametre.distribution.secondary.ParametreDistributionPersistence;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.objectNotNullOrThrow;
import static fr.acoss.posdoc.domain.parametre.distribution.validators.ParametreDistributionValidators.*;

public class ParametreDistributionService {

  public static final String LOGICIEL_DISTRIBUTION = "logicielDistribution";
  public static final String PARAMETRE_DISTRIBUTION = "ParametreDistribution";
  public static final String RESSOURCE = "Ressource";
  private final  ParametreDistributionPersistence parametreDistributionPersistence;
  private final RessourcePersistence ressourcePersistence;

  public ParametreDistributionService(
          final ParametreDistributionPersistence parametreDistributionPersistence,
          final RessourcePersistence ressourcePersistence
  ) {
    this.parametreDistributionPersistence = parametreDistributionPersistence;
    this.ressourcePersistence = ressourcePersistence;
  }

  public ParametreDistribution createParametreDistribution(final ParametreDistribution parametreDistribution) {

    referenceValidator().validate(parametreDistribution.getReference());
    libelleValidator().validate(parametreDistribution.getLibelle());
    commandeDistributionValidator().validate(parametreDistribution.getCommandeDistribution());

    objectNotNullOrThrow(LOGICIEL_DISTRIBUTION).validate(parametreDistribution
        .getLogicielDistribution());

    if (parametreDistributionPersistence.exists(parametreDistribution.getReference())) {
      throw new AlreadyExistingElement(PARAMETRE_DISTRIBUTION, parametreDistribution.getReference());
    }

    return parametreDistributionPersistence.create(parametreDistribution);
  }

  public ParametreDistribution updateParametreDistribution(final ParametreDistribution parametreDistribution) {

    referenceValidator().validate(parametreDistribution.getReference());
    libelleValidator().validate(parametreDistribution.getLibelle());
    commandeDistributionValidator().validate(parametreDistribution.getCommandeDistribution());

    objectNotNullOrThrow(LOGICIEL_DISTRIBUTION).validate(parametreDistribution
        .getLogicielDistribution());

    if (!parametreDistributionPersistence.exists(parametreDistribution.getReference())) {
      throw new ElementNotFoundException(PARAMETRE_DISTRIBUTION, parametreDistribution.getReference());
    }

    return parametreDistributionPersistence.create(parametreDistribution);
  }

  public void deleteParametreDistributions(final List<String> parametreDistributionCodes) {
    // vérification dépendance Ressource
    List<String> listRes = ressourcePersistence.parametreDistributionsExistsInRessource(parametreDistributionCodes);
    if (!listRes.isEmpty()) {
      throw new StileExistingElement(RESSOURCE, parametreDistributionCodes, PARAMETRE_DISTRIBUTION);
    }
    parametreDistributionPersistence.deleteAll(parametreDistributionCodes);
  }

}
