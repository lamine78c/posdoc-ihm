package fr.acoss.posdoc.exceptions;

public class NegativeValueForbiddenException extends PosdocException {

  public NegativeValueForbiddenException(final String fieldName) {
    super(String.format("Le champs \"%s\" doit être positif", fieldName));
  }
}
