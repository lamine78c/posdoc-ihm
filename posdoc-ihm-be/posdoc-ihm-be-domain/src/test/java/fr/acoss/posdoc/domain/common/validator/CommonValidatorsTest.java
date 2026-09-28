package fr.acoss.posdoc.domain.common.validator;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CommonValidatorsTest {

    @Test
    void stringSizeValidator_ok() {
        assertTrue(CommonValidators.stringSizeValidator(1, 10).validate("abcde"));
        assertTrue(CommonValidators.stringSizeValidator(1, 10).validate("ab"));
        assertTrue(CommonValidators.stringSizeValidator(1, 10).validate("abcdefghi"));

        assertFalse(CommonValidators.stringSizeValidator(1, 10).validate("a"), "Valeur borne min");
        assertFalse(CommonValidators.stringSizeValidator(1, 10).validate("abcdefghij"), "Valeur borne max");
        assertFalse(CommonValidators.stringSizeValidator(1, 10).validate(null));
    }

    @Test
    void stringSizeValidatorMaxInclude() {
        assertTrue(CommonValidators.stringSizeValidatorMaxInclude(1, 10).validate("abcde"));
        assertTrue(CommonValidators.stringSizeValidatorMaxInclude(1, 10).validate("ab"));
        assertTrue(CommonValidators.stringSizeValidatorMaxInclude(1, 10).validate("abcdefghi"));
        assertTrue(CommonValidators.stringSizeValidatorMaxInclude(1, 10).validate("abcdefghij"), "Valeur borne max");

        assertFalse(CommonValidators.stringSizeValidatorMaxInclude(1, 10).validate("a"), "Valeur borne min");
        assertFalse(CommonValidators.stringSizeValidatorMaxInclude(1, 10).validate("abcdefghijq"), "Valeur supérieur borne max");
        assertFalse(CommonValidators.stringSizeValidatorMaxInclude(1, 10).validate(null));
    }

    @Test
    void stringSizeValidatorMaxAndMinInclude() {
        assertTrue(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate("abcde"));
        assertTrue(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate("ab"));
        assertTrue(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate("abcdefghi"));
        assertTrue(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate("abcdefghij"), "Valeur borne max");
        assertTrue(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate("a"), "Valeur borne min");

        assertFalse(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate(""), "Valeur inferieur borne min");
        assertFalse(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate("abcdefghijq"), "Valeur supérieur borne max");
        assertFalse(CommonValidators.stringSizeValidatorMaxAndMinInclude(1, 10).validate(null));
    }

    @Test
    void stringSizeValidatorEquals() {
        assertTrue(CommonValidators.stringSizeValidatorEquals(4).validate("abcd"));

        assertFalse(CommonValidators.stringSizeValidatorEquals(4).validate(""), "Valeur inferieur borne");
        assertFalse(CommonValidators.stringSizeValidatorEquals(4).validate("abcdefghijq"), "Valeur supérieur borne");
        assertFalse(CommonValidators.stringSizeValidatorEquals(4).validate(null));
    }
}
