package fr.acoss.posdoc.domain.gammes.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringSizeException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorEquals;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class GammeValidators {

    private GammeValidators () {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> codeValidator() {
        return stringSizeValidatorEquals(2).orThrow(v -> new InvalidStringSizeException("code",
                2,
                v));
    }

    public static Validator<String> libelleValidator() {
        return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("libelle",
                1,
                50,
                v));
    }

    public static Validator<String> codeVerrouValidator() {
        return stringSizeValidatorMaxInclude(0, 8).orThrow(v -> new InvalidStringBoundsException("codeVerrou",
                1,
                8,
                v));
    }

}
