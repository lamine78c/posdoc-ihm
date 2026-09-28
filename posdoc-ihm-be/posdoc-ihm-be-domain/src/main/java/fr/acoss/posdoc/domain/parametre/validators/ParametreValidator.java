package fr.acoss.posdoc.domain.parametre.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class ParametreValidator {

  private ParametreValidator() {
    throw new IllegalStateException("Utility class");
  }

  public static Validator<String> codeValidator() {
    return stringSizeValidatorMaxInclude(0, 6).orThrow(v -> new InvalidStringBoundsException("code",
        1,
        6,
        v));
  }

  public static Validator<String> valueValidator() {
    return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("value",
        1,
        50,
        v));
  }

  public static Validator<String> libelleValidator() {
    return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("libelle",
        1,
        50,
        v));
  }

}
