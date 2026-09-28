package fr.acoss.posdoc.domain.composition.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringSizeException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorEquals;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class CompositionValidators {

    private CompositionValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> codeValidator() {
        return stringSizeValidatorEquals(1).orThrow(v -> new InvalidStringSizeException("code",
                1,
                v));
    }

    public static Validator<String> libelleValidator() {
        return stringSizeValidatorMaxInclude(0, 50).orThrow(v -> new InvalidStringBoundsException("libelle",
                0,
                50,
                v));
    }

}
