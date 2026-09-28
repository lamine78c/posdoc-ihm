package fr.acoss.posdoc.domain.application.parimary;


import fr.acoss.posdoc.domain.application.model.Application;
import fr.acoss.posdoc.domain.application.model.ApplicationComposite;
import fr.acoss.posdoc.domain.application.secondary.ApplicationPersistence;
import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.secondary.CommandePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ApplicationService {

  private final ApplicationPersistence applicationPersistence;
  private final CommandePersistence commandePersistence;

  public ApplicationService(final ApplicationPersistence applicationPersistence,final CommandePersistence commandePersistence) {
    this.applicationPersistence = applicationPersistence;
    this.commandePersistence = commandePersistence;
  }

  public Application createApplication(final Application application) {
    if (applicationPersistence.exists(application.getCodeEnvironnement(), application.getCodeOrganisation(), application.getCode())) {
      throw new AlreadyExistingElement("Application", application.getCode());
    }
    return applicationPersistence.create(application);
  }

  public Application updateApplication(final Application application) {
    return applicationPersistence.update(application);
  }

  public void deleteApplications(List<ApplicationComposite> applications) {
    // vérification dépendance Commande
    boolean applicationsExistsInCommandes = commandePersistence.applicationsExistsInCommandes(applications);
    if (applicationsExistsInCommandes) {
      throw new StileExistingElement("Application", applications.stream().map(ApplicationComposite::getCode).collect(Collectors.toList()),  "Commande");
    }

    final int[] num = {0};

    applications.forEach(id -> {
      // find in commande table
      List<Commande> commandes;
      List<String> codesOrg = new ArrayList<>();
      List<String> codesApp = new ArrayList<>();
      codesOrg.add(id.getCodeOrganisation());
      codesApp.add(id.getCode());
      commandes = commandePersistence.findCommandesByApp(id.getCodeEnvironnement(), codesOrg, codesApp);
      if (!commandes.isEmpty()) {
        num[0] = num[0] +1;
      }

    });
    try {
      if (num[0] == 0 ) {
        applicationPersistence.deleteAll(applications);
      }

     else  throw new CustomExceptionMessage("Impossible de supprimer les applications");

    } catch (Exception e) {
      throw new CustomExceptionMessage(e.getMessage());
    }
  }

}
