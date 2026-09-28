package fr.acoss.posdoc.exceptions;

public class NullFieldException extends PosdocException {

  public NullFieldException(final String fieldName) {
    super(String.format("Le champs \"%s\" ne doit pas être null", fieldName));
  }

}
