package fr.acoss.posdoc.domain.multif.primary;

import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.multif.model.Multif;
import fr.acoss.posdoc.domain.multif.secondary.MultifPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.client.validators.ClientValidators.codeValidator;
import static fr.acoss.posdoc.domain.client.validators.ClientValidators.libelleValidator;

public class MultifService {

  private MultifPersistence multifPersistence;
  private FichierPersistence fichierPersistence;

  public MultifService(final MultifPersistence multifPersistence, FichierPersistence fichierPersistence) {
    this.multifPersistence = multifPersistence;
    this.fichierPersistence = fichierPersistence;
  }

  public Multif createMultif(final Multif multif) {

    codeValidator().validate(multif.getCode());
    libelleValidator().validate(multif.getLibelle());

    if (multifPersistence.exists(multif.getCode())) {
      throw new AlreadyExistingElement("Multif", multif.getCode());
    }

    return multifPersistence.create(multif);
  }

  public Multif updateMultif(final Multif multif) {

    codeValidator().validate(multif.getCode());
    libelleValidator().validate(multif.getLibelle());

    if (!multifPersistence.exists(multif.getCode())) {
      throw new ElementNotFoundException("multif", multif.getCode());
    }

    return multifPersistence.create(multif);
  }

  public void deleteMultifs(List<String> multifCodes) {
    // vérification dépendance Fichier
    List<String> lisMul = fichierPersistence.multifsExistsInFichiers(multifCodes);
    if (!lisMul.isEmpty()) {
      throw new StileExistingElement("Multi feuillet", lisMul,  "Fichier");
    }
    multifPersistence.deleteAll(multifCodes);
  }

}
