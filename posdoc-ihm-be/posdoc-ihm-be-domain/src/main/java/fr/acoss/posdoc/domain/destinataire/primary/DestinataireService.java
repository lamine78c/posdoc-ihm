package fr.acoss.posdoc.domain.destinataire.primary;

import fr.acoss.posdoc.domain.destinataire.model.Destinataire;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import fr.acoss.posdoc.domain.destinataire.secondary.DestinatairePersistence;
import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.ArrayList;
import java.util.List;

import static fr.acoss.posdoc.domain.destinataire.validators.DestinataireValidators.codeValidator;
import static fr.acoss.posdoc.domain.destinataire.validators.DestinataireValidators.libelleValidator;

public class DestinataireService {

  public static final String DESTINATAIRE = "Destinataire";
  public static final String ORGANISME = "Organisme";
  public static final String EXEMPLAIRE = "Exemplaire";

  private final DestinatairePersistence destinatairePersistence;
  private final OrganismePersistence  organismePersistence;
  private final ExemplairePersistence exemplairePersistence;

  public DestinataireService(final DestinatairePersistence destinatairePersistence, final OrganismePersistence organismePersistence, final ExemplairePersistence exemplairePersistence) {
    this.destinatairePersistence = destinatairePersistence;
    this.organismePersistence = organismePersistence;
    this.exemplairePersistence = exemplairePersistence;
  }

  public List<Destinataire> createDestinataires(final List<Destinataire> destinataires) {

    List<Destinataire> destinToUpdate = new ArrayList<>();
    List<Destinataire> destinToIgnore = new ArrayList<>();

    destinataires.stream().forEach(e -> {

      codeValidator().validate(e.getCode());
      libelleValidator().validate(e.getLibelle());

      // vérification dépendance Organisme
      if (!organismePersistence.exists(e.getCodeOrg())) {
        throw new ElementNotFoundException(ORGANISME, e.getCodeOrg());
      }

      // on ignore les lignes existants
      if (destinatairePersistence.exists(e.getCode(), e.getCodeOrg())) {
        destinToIgnore.add(e);
      }else {
        destinToUpdate.add(e);
      }

    });

    // si aucun destinataire va créer
    if(!destinToIgnore.isEmpty() && destinToUpdate.isEmpty()) {
      throw new AlreadyExistingElement(DESTINATAIRE, destinToIgnore.get(0).getCode());
    }

    return destinatairePersistence.updateAll(destinToUpdate);
  }

  public Destinataire updateDestinataire(final Destinataire destinataire) {

    codeValidator().validate(destinataire.getCode());
    libelleValidator().validate(destinataire.getLibelle());

    if (!destinatairePersistence.exists(destinataire.getCode(), destinataire.getCodeOrg())) {
      throw new ElementNotFoundException(DESTINATAIRE, destinataire.getCode()+' '+destinataire.getCodeOrg());
    }

    // vérification dépendance Organisme
    if (!organismePersistence.exists(destinataire.getCodeOrg())) {
      throw new ElementNotFoundException(ORGANISME, destinataire.getCodeOrg());
    }

    return destinatairePersistence.update(destinataire);
  }

  public void deleteDestinataires(List<DestinataireCompositeIdModel> ids) {
    List<String> codeDes = new ArrayList<>();
    ids.forEach(e->codeDes.add(e.getCode()));

    // vérification dépendance Exemplaire
    ids.forEach(id->{
      if (exemplairePersistence.destinataireExistInExemplaires(id)) {
        throw new StileExistingElement(DESTINATAIRE, id,  EXEMPLAIRE);
      }
    });

    destinatairePersistence.deleteAll(ids);
  }
}
