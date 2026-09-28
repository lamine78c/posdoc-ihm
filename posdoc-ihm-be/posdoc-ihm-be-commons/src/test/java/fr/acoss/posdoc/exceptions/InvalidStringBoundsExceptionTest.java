package fr.acoss.posdoc.exceptions;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InvalidStringBoundsExceptionTest {

  @Test
  void test() {

    final var exception = new InvalidStringBoundsException("message",
        1,
        10,
        "Message de plus de 10 caractères");

    assertEquals(
        "La taille du champs \"message\" est hors borne (min : 1 caractère, max : 10 caractères, actuellement : 32 caractères)",
        exception.getMessage());

  }

}