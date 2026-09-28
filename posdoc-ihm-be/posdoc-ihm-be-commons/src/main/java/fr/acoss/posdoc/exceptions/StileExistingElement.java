package fr.acoss.posdoc.exceptions;

public class StileExistingElement extends PosdocException {

  public StileExistingElement(final String elementName, final Object id, final String table) {
    super(String.format("La supression échouée car %s(s) %s font référence dans la table %s, ", elementName, id, table));
  }
}
