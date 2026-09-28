package fr.acoss.posdoc.domain.site.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class SiteValidators {

  private SiteValidators() {
    throw new IllegalStateException("Utility class");
  }

  public static Validator<String> codeSiteCNPValidator() {
    return stringSizeValidatorMaxInclude(0, 6).orThrow(value -> new InvalidStringBoundsException("code",
        1,
        6,
        value));
  }

  public static Validator<String> hostValidator() {
    return stringSizeValidatorMaxInclude(0, 50).orThrow(value -> new InvalidStringBoundsException("host",
        1,
        50,
        value));
  }

  public static Validator<String> usernameValidator() {
    return stringSizeValidatorMaxInclude(0, 12).orThrow(value -> new InvalidStringBoundsException("username",
        1,
        12,
        value));
  }

  public static Validator<String> passwordValidator() {
    return stringSizeValidatorMaxInclude(0, 12).orThrow(value -> new InvalidStringBoundsException("password",
        1,
        12,
        value));
  }

  public static Validator<String> ressourceDelestageValidator() {
    return stringSizeValidatorMaxInclude(0, 8).orThrow(value -> new InvalidStringBoundsException("ressourceDelestage",
        1,
        8,
        value));
  }

  public static Validator<String> organismeMassificationValidator() {
    return stringSizeValidatorMaxInclude(0, 3).orThrow(value -> new InvalidStringBoundsException("organismeMassification",
        1,
        3,
        value));
  }

  public static Validator<String> codeOrganismeValidator() {
    return stringSizeValidatorMaxInclude(0, 3).orThrow(value -> new InvalidStringBoundsException("codeOrganisme",
        1,
        3,
        value));
  }

  public static Validator<String> codeSiteDematValidator() {
    return stringSizeValidatorMaxInclude(0, 6).orThrow(value -> new InvalidStringBoundsException("codeSiteDematerialisation",
        1,
        6,
        value));

  }

  public static Validator<String> codeSiteProdocsValidator() {
    return stringSizeValidatorMaxInclude(0, 6).orThrow(value -> new InvalidStringBoundsException("code",
        1,
        3,
        value));
  }
}

