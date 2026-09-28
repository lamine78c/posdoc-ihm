package fr.acoss.posdoc.exceptions;

public class EnumParsingException extends PosdocException {

  public EnumParsingException(final String value, final Class<?> clazz) {

    super(String.format("Echec du parsing de la valeur \"%s\", vers l'enum %s",
        value,
        clazz.getSimpleName()));
  }
}
