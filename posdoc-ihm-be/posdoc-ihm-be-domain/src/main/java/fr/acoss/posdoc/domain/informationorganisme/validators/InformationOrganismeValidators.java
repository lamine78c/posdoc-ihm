package fr.acoss.posdoc.domain.informationorganisme.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class InformationOrganismeValidators {

  private InformationOrganismeValidators() {
    throw new IllegalStateException("Utility class");
  }

  public static Validator<String> messageValidator() {
    return stringSizeValidatorMaxInclude(0, 250)
        .orThrow(value -> new InvalidStringBoundsException("message", 0, 250, value));
  }

}
