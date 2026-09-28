package fr.acoss.posdoc.domain.profile.validators;

import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.stringSizeValidatorMaxInclude;

public class ProfileValidators {

    private ProfileValidators(){throw new IllegalStateException("Utility class");}

    public static Validator<String> profileValidator() {
        return stringSizeValidatorMaxInclude(0, 20).orThrow(value -> new InvalidStringBoundsException("code profile",
                1,
                20,
                value));
    }

    public static Validator<String> libelleProfileValidator() {
        return stringSizeValidatorMaxInclude(0, 50).orThrow(value -> new InvalidStringBoundsException("libelle profile",
                1,
                50,
                value));
    }
}
