package fr.acoss.posdoc.domain.parametre.edition.primary;

import fr.acoss.posdoc.domain.format.secondary.FormatPersistence;
import fr.acoss.posdoc.domain.parametre.edition.model.ParametreEdition;
import fr.acoss.posdoc.domain.parametre.edition.secondary.ParametreEditionPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.util.List;

public class ParametreEditionService {

  private ParametreEditionPersistence parametreEditionPersistence;
  private FormatPersistence formatPersistence;

  public ParametreEditionService(final ParametreEditionPersistence parametreEditionPersistence, final FormatPersistence formatPersistence) {
    this.parametreEditionPersistence = parametreEditionPersistence;
    this.formatPersistence = formatPersistence;
  }

  public ParametreEdition createParametreEdition(final ParametreEdition parametreEdition) {

    if (parametreEditionPersistence.exists(parametreEdition.getReference())) {
      throw new AlreadyExistingElement("ParametreEdition", parametreEdition.getReference());
    }
    this.verify(parametreEdition);
    return parametreEditionPersistence.create(parametreEdition);
  }

  public ParametreEdition updateParametreEdition(final ParametreEdition parametreEdition) {

    if (!parametreEditionPersistence.exists(parametreEdition.getReference())) {
      throw new ElementNotFoundException("ParametreEdition", parametreEdition.getReference());
    }
    this.verify(parametreEdition);
    return parametreEditionPersistence.update(parametreEdition);
  }

  public void deleteParametresEdition(List<String> ids) {
    parametreEditionPersistence.deleteAll(ids);
  }

  private void verify(ParametreEdition parametreEdition) {
    if (!formatPersistence.existsByType(parametreEdition.getType())) {
      throw new ElementNotFoundException("Format", parametreEdition.getType());
    }
  }
}
