package fr.acoss.posdoc.exceptions;

public class AlreadyExistingElement extends PosdocException {

  public AlreadyExistingElement(final String elementName, final Object id) {
    super(String.format("L'élément %s (%s) est déjà existant", elementName, id));
  }
}
