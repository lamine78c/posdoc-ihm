package fr.acoss.posdoc.exceptions;

public class CustomExceptionMessage extends PosdocException {
  public CustomExceptionMessage(final String message) {
    super(String.format(message));
  }
}
