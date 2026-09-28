package fr.acoss.posdoc.domain.organisme.primary;

import fr.acoss.posdoc.domain.application.secondary.ApplicationPersistence;
import fr.acoss.posdoc.domain.destinataire.secondary.DestinatairePersistence;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

public class OrganismeService {

  private static final String ORGANISME = "Organisme";
  private static final String APPLICATION = "Application";
  private static final String DESTINATION = "Destination";
  private static final String DESTINATION_DESTINATION = "Application et Destination";

  private final OrganismePersistence organismePersistence;

  private final ApplicationPersistence applicationPersistence;

  private final DestinatairePersistence destinatairePersistence;

  public OrganismeService(
          final OrganismePersistence organismePersistence,
          final ApplicationPersistence applicationPersistence,
          final DestinatairePersistence destinatairePersistence
  ) {
    this.organismePersistence = organismePersistence;
    this.applicationPersistence = applicationPersistence;
    this.destinatairePersistence = destinatairePersistence;
  }

  public Organisme createOrganisme(final Organisme organisme) {
    if (organismePersistence.exists(organisme.getCode())) {
      throw new AlreadyExistingElement(ORGANISME, organisme.getCode());
    }
    return organismePersistence.create(organisme);
  }

  public Organisme updateOrganisme(final Organisme organisme) {
    if (!organismePersistence.exists(organisme.getCode())) {
      throw new ElementNotFoundException(ORGANISME, organisme.getCode());
    }
    return organismePersistence.update(organisme);
  }

  public void deleteOrganismes(List<String> organismeCodes) {
    // vérification dépendance Application
    List<String> listApp = applicationPersistence.organismesExistsInApplications(organismeCodes);
    // vérification dépendance Destinataire
    List<String> listDest = destinatairePersistence.organismesExistsInDestinations(organismeCodes);
    if (!listApp.isEmpty() && !listDest.isEmpty()) {
      // Les deux listes ne sont pas vides
      throw new StileExistingElement(ORGANISME, organismeCodes, DESTINATION_DESTINATION);
    } else if (!listApp.isEmpty()) {
      // Seule la liste des applications n'est pas vide
      throw new StileExistingElement(ORGANISME, organismeCodes, APPLICATION);
    } else if (!listDest.isEmpty()) {
      // Seule la liste des destinataires n'est pas vide
      throw new StileExistingElement(ORGANISME, organismeCodes, DESTINATION);
    }
    organismePersistence.deleteAll(organismeCodes);
  }
}
