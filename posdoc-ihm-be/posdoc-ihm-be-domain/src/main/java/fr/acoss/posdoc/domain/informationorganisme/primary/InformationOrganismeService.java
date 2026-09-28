package fr.acoss.posdoc.domain.informationorganisme.primary;

import fr.acoss.posdoc.domain.informationorganisme.model.InformationOrganisme;
import fr.acoss.posdoc.domain.informationorganisme.secondary.InformationOrganismePersistence;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.objectNotNullOrThrow;
import static fr.acoss.posdoc.domain.informationorganisme.validators.InformationOrganismeValidators.messageValidator;

public class InformationOrganismeService {

  private final InformationOrganismePersistence informationOrganismePersistence;

  private final OrganismePersistence organismePersistence;

  public InformationOrganismeService(
      final InformationOrganismePersistence informationOrganismePersistence,
      final OrganismePersistence organismePersistence) {

    this.informationOrganismePersistence = informationOrganismePersistence;
    this.organismePersistence = organismePersistence;
  }

  public List<InformationOrganisme> createInformationOrganisme(
      final List<InformationOrganisme> informationOrganismes) {

    //On vérifie que les organismes existent

    final var now = LocalDateTime.now();

    for (final InformationOrganisme infoOrganisme : informationOrganismes) {

      messageValidator().validate(infoOrganisme.getMessage());
      objectNotNullOrThrow("actif").validate(infoOrganisme.getActif());

      //Si on trouve pas l'organisme rattaché
      if (!organismePersistence.exists(infoOrganisme.getOrganisme().getCode())) {
        throw new ElementNotFoundException("Organisme", infoOrganisme.getOrganisme().getCode());
      }

      infoOrganisme.setDate(now);
    }
    return informationOrganismePersistence.create(informationOrganismes);
  }

  public InformationOrganisme updateInformationOrganisme(
      final InformationOrganisme informationOrganisme) {

    messageValidator().validate(informationOrganisme.getMessage());
    objectNotNullOrThrow("actif").validate(informationOrganisme.getActif());

    informationOrganisme.setDate(LocalDateTime.now());

    return informationOrganismePersistence.update(informationOrganisme);
  }

  public void deleteInformationOrganisme(final Integer infoOrganismeId) {
    informationOrganismePersistence.delete(infoOrganismeId);
  }

}
