package fr.acoss.posdoc.exceptions;

public class NoConverterFoundException extends PosdocException {

  public NoConverterFoundException(final String value, final Class<?> clazz) {
    super(String.format("Aucune convertisseur transformant la valeur %s vers le type %s",
        value,
        clazz.getSimpleName()));
  }

}
