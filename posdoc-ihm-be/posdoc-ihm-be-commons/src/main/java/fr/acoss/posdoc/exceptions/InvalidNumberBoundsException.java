package fr.acoss.posdoc.exceptions;

public class InvalidNumberBoundsException extends PosdocException {

  public InvalidNumberBoundsException(final String fieldName, final Number min, final Number max,
                                      final Number actual) {

    super(String.format(
        "La champs \"%s\" est hors borne (min : %s, max : %s, actuellement : %s)",
        fieldName,
        min,
        max,
        actual));
  }
}
