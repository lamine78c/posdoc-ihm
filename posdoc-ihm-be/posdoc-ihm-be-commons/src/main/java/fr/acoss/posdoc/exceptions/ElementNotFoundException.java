package fr.acoss.posdoc.exceptions;

public class ElementNotFoundException extends PosdocException {

  public ElementNotFoundException(final String elementName, final Object id) {
    super(String.format("L'élément %s (%s) n'existe pas", elementName, id));
  }
}
