package fr.acoss.posdoc.exceptions;

public class InvalidStringBoundsException extends PosdocException {

  private static final String CARACTERES = " caractères";

  public InvalidStringBoundsException(final String fieldName, final Integer min, final Integer max,
                                      final String actual) {

    super(String.format(
        "La taille du champs \"%s\" est hors borne (min : %s, max : %s, actuellement : %s)",
        fieldName,
        min == 1 ? "1 caractère": min + CARACTERES,
        max == 1 ? "1 caractère": max + CARACTERES,
        actual == null ? null : actual.length() + CARACTERES));
  }

}
