package fr.acoss.posdoc.domain.environnement.validators;

import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringSizeException;
import org.junit.jupiter.api.Test;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EnvironnementValidatorsTest {

  @Test
  void codeValidator_ok() {

    assertEquals(true, EnvironnementValidators.codeValidator().validate("a"));
    assertEquals(true, EnvironnementValidators.codeValidator().validate("b"));
    assertEquals(true, EnvironnementValidators.codeValidator().validate("v"));
    assertEquals(true, EnvironnementValidators.codeValidator().validate("e"));

  }

  @Test
  void codeValidator_throw_exception() {

    final var validator = EnvironnementValidators.codeValidator();

    assertThrows(
        InvalidStringSizeException.class,
        () -> validator.validate("aa"));
    assertThrows(
        InvalidStringSizeException.class,
        () -> validator.validate("azakzlk"));
    assertThrows(
        InvalidStringSizeException.class,
        () -> validator.validate(null));
  }

  @Test
  void libelleValidator() {

    assertEquals(true, EnvironnementValidators.libelleValidator().validate("bla"));
    assertEquals(true, EnvironnementValidators.libelleValidator().validate("bbla"));
    assertEquals(true, EnvironnementValidators.libelleValidator().validate("blablabla"));
    assertEquals(true, EnvironnementValidators.libelleValidator().validate("test"));

  }

  @Test
  void libelleValidator_throw_exception() {

    //51 chars
    final var collect = Stream.generate(() -> "a").limit(51).collect(Collectors.joining());
    final var validator = EnvironnementValidators.libelleValidator();

    assertThrows(
        InvalidStringBoundsException.class,
        () -> validator.validate(collect));

    assertThrows(
        InvalidStringBoundsException.class,
        () -> validator.validate(null));

  }

}