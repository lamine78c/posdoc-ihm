package fr.acoss.posdoc.domain.imprime.validators;

import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ImprimeValidatorsTest {

  @Test
  void codeRNDValidator() {

    final var codeRNDValidator = ImprimeValidators.codeRNDValidator();

    assertTrue(codeRNDValidator.validate(null));
    assertTrue(codeRNDValidator.validate("")); //OK
    assertTrue(codeRNDValidator.validate("CODE")); //OK
    assertTrue(codeRNDValidator.validate("AZERTYUIOPQSDF")); //14 caractères OK
    final var tooLongString = "AZERTYUIOPQSDFG";
    assertThrows(InvalidStringBoundsException.class,
        () -> codeRNDValidator.validate(tooLongString)); //15 caractères KO
  }
}