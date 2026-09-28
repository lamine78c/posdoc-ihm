package fr.acoss.posdoc.domain.ressource.primary;

import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import fr.acoss.posdoc.domain.ressource.model.Ressource;
import fr.acoss.posdoc.domain.ressource.model.RessourceCompositeIdModel;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.AlreadyExistingElementWithCustomMessage;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;


public class RessourceService {

  private final RessourcePersistence ressourcePersistence;
  private final ExemplairePersistence exemplairePersistence;

  public RessourceService(
          final RessourcePersistence ressourcePersistence,
          final ExemplairePersistence exemplairePersistence
  ) {
    this.ressourcePersistence = ressourcePersistence;
    this.exemplairePersistence = exemplairePersistence;
  }

  public Ressource createRessource(final Ressource ressource) {

    if (ressource.getCodeOrganisme().equals("999") && ressourcePersistence.isGenericRessourceHasSpecifiqueOne("999", ressource)) {
      throw new AlreadyExistingElementWithCustomMessage("La Ressource générique ["+ressource.getCodeRessource()+"] ne peut pas être ajouté");
    }
    if (!ressource.getCodeOrganisme().equals("999") && ressourcePersistence.isSpecifiqueRessourceHasGenericOne("999", ressource)) {
      throw new AlreadyExistingElementWithCustomMessage("La Ressource specifique ["+ressource.getCodeRessource()+"] ne peut pas être ajouté");
    }
    if (ressourcePersistence.exists(ressource)) {
      throw new AlreadyExistingElement("Ressource", ressource.getCodeRessource());
    }

    return ressourcePersistence.create(ressource);
  }

  public Ressource updateRessource(final Ressource ressource) {
    return ressourcePersistence.create(ressource);
  }

  public void deleteRessources(List<RessourceCompositeIdModel> ressourceCodes) {
    // vérification dépendance Exemplaire
    ressourceCodes.forEach(id->{
      if (exemplairePersistence.ressourceExistsInExemplaires(id)) {
        throw new StileExistingElement("Ressource", id,  "Exemplaire");
      }
    });
    ressourcePersistence.deleteAll(ressourceCodes);
  }

}
