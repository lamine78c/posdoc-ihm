package fr.acoss.posdoc.domain.support.primary;

import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.support.model.Support;
import fr.acoss.posdoc.domain.support.secondary.SupportPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.support.validators.SupportValidators.*;

public class SupportService {

  public static final String SUPPORT = "Support";
  public static final String FICHIER = "Fichier";
  private final SupportPersistence supportPersistence;
  private final FichierPersistence fichierPersistence;

  public SupportService(final SupportPersistence supportPersistence, final FichierPersistence fichierPersistence) {
    this.supportPersistence = supportPersistence;
    this.fichierPersistence = fichierPersistence;
  }

  public Support createSupport(final Support support) {

    validateParameterSizes(support);

    if (supportPersistence.exists(support.getType())) {
      throw new AlreadyExistingElement(SUPPORT, support.getType());
    }

    return supportPersistence.update(support);
  }

  public Support updateSupport(final Support support) {
    validateParameterSizes(support);

    if (!supportPersistence.exists(support.getType())) {
      throw new ElementNotFoundException(SUPPORT, support.getType());
    }

    return supportPersistence.update(support);
  }

  private void validateParameterSizes(final Support support) {

    typeValidator().validate(support.getType());
    libelleValidator().validate(support.getLibelle());
    poidsValidator().validate(support.getPoids());

  }
  public void deleteSupports(List<String> supportCodes) {
    // vérification dépendance Fichier
    List<String> listSup = fichierPersistence.supportsExistsInFichiers(supportCodes);
    if (!listSup.isEmpty()) {
      throw new StileExistingElement(SUPPORT, supportCodes, FICHIER);
    }
    supportPersistence.deleteAll(supportCodes);
  }

}
