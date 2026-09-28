package fr.acoss.posdoc.domain.parametre.echantillon.primary;

import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.parametre.echantillon.model.ParametreEchantillon;
import fr.acoss.posdoc.domain.parametre.echantillon.secondary.ParametreEchantillonPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;
import fr.acoss.posdoc.types.TypeEchantillon;

import java.util.List;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.objectNotNullOrThrow;
import static fr.acoss.posdoc.domain.parametre.echantillon.validators.ParametreEchantillonValidators.*;

public class ParametreEchantillonService {

  private ParametreEchantillonPersistence parametreEchantillonPersistence;
  private FichierPersistence fichierPersistence;

  public ParametreEchantillonService(
      final ParametreEchantillonPersistence parametreEchantillonPersistence,
      FichierPersistence fichierPersistence
  ) {
    this.parametreEchantillonPersistence = parametreEchantillonPersistence;
    this.fichierPersistence = fichierPersistence;
  }

  public ParametreEchantillon createParametreEchantillon(
      final ParametreEchantillon parametreEchantillon) {

    verify(parametreEchantillon);

    if (parametreEchantillonPersistence.exists(parametreEchantillon.getReference())) {
      throw new AlreadyExistingElement("ParametreEchantillon", parametreEchantillon.getReference());
    }

    return parametreEchantillonPersistence.create(parametreEchantillon);
  }

  public ParametreEchantillon updateParametreEchantillon(
      final ParametreEchantillon parametreEchantillon) {

    verify(parametreEchantillon);

    if (!parametreEchantillonPersistence.exists(parametreEchantillon.getReference())) {
      throw new ElementNotFoundException("ParametreEchantillon",
          parametreEchantillon.getReference());
    }

    return parametreEchantillonPersistence.update(parametreEchantillon);
  }

  private void verify(ParametreEchantillon parametreEchantillon) {
    referenceValidator().validate(parametreEchantillon.getReference());
    objectNotNullOrThrow("type").validate(parametreEchantillon.getType());
    objectNotNullOrThrow("random").validate(parametreEchantillon.getRandom());

    if (parametreEchantillon.getType() == TypeEchantillon.LOT) {
      nombreLotsValidator().validate(parametreEchantillon.getNombreLots());
      nombrePagesValidator().validate(parametreEchantillon.getNombrePages());
    } else {
      formuleValidator().validate(parametreEchantillon.getFormule());
    }
  }

  public void deleteParametreEchantillons(List<String> echantillonCodes) {
    // vérification dépendance Fichier
    List<String> listFich = fichierPersistence.echantillonsExistsInFichiers(echantillonCodes);
    if (!listFich.isEmpty()) {
      throw new StileExistingElement("Echantillon", echantillonCodes,  "Fichier");
    }
    parametreEchantillonPersistence.deleteAll(echantillonCodes);
  }

}
