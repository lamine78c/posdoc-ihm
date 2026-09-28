package fr.acoss.posdoc.domain.parametre.primary;

import fr.acoss.posdoc.domain.parametre.model.Parametre;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import static fr.acoss.posdoc.domain.parametre.validators.ParametreValidator.*;

public class ParametreService {

  final ParametrePersistence parametrePersistence;

  public ParametreService(final ParametrePersistence parametrePersistence) {
    this.parametrePersistence = parametrePersistence;
  }

  public Parametre createParametre(final Parametre parametre) {

    codeValidator().validate(parametre.getCode());
    valueValidator().validate(parametre.getValue());
    libelleValidator().validate(parametre.getLibelle());

    if (parametrePersistence.exists(parametre.getCode())) {
      throw new AlreadyExistingElement("Parametre", parametre.getCode());
    }

    return parametrePersistence.create(parametre);
  }

  public Parametre updateParametre(final Parametre parametre) {

    codeValidator().validate(parametre.getCode());
    valueValidator().validate(parametre.getValue());
    libelleValidator().validate(parametre.getLibelle());

    if (!parametrePersistence.exists(parametre.getCode())) {
      throw new ElementNotFoundException("Parametre", parametre.getCode());
    }

    return parametrePersistence.create(parametre);
  }

  public void deleteParametre(final String code) {
    parametrePersistence.delete(code);
  }

  public void deleteParametres(Iterable<String> ids) {
    parametrePersistence.deleteAll(ids);
  }

}
