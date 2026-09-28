package fr.acoss.posdoc.exceptions;

public class AlreadyExistingElementWithCustomMessage extends PosdocException {

  public AlreadyExistingElementWithCustomMessage(final String message) {
    super(String.format(message));
  }
}
