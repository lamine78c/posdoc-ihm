package fr.acoss.posdoc.domain.serviceposdoc.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class ServicePosdocValidators {

    private ServicePosdocValidators() {
        throw new IllegalStateException("Utility class");
    }

    public static Validator<String> libelleValidator() {
        return stringSizeValidatorMaxInclude(0, 100).orThrow(v -> new InvalidStringBoundsException("libelle",
                1,
                100,
                v));
    }

    public static Validator<String> urlValidator() {
        return stringSizeValidatorMaxInclude(0, 250).orThrow(v -> new InvalidStringBoundsException("url",
                1,
                250,
                v));
    }
}
