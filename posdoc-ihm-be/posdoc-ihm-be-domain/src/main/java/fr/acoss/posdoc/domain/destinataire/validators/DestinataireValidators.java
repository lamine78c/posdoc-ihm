package fr.acoss.posdoc.domain.destinataire.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class DestinataireValidators {

  private DestinataireValidators() {
    throw new IllegalStateException("Utility class");
  }

  public static Validator<String> codeValidator() {
    return stringSizeValidatorMaxInclude(0, 8).orThrow(v -> new InvalidStringBoundsException("code",
        1,
        8,
        v));
  }

  public static Validator<String> libelleValidator() {
    return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("libelle",
        1,
        50,
        v));
  }

}
