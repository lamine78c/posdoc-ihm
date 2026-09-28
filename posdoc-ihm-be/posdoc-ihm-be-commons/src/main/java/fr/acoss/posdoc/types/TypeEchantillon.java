package fr.acoss.posdoc.types;

import fr.acoss.posdoc.exceptions.EnumParsingException;

public enum TypeEchantillon {

  LOT("L"), PAGE("P");

  private String value;

  TypeEchantillon(final String value) {
    this.value = value;
  }

  public String getShortValue() {
    return value;
  }

  public static TypeEchantillon fromValue(final String value) {
    for (final var typeEchantillon : TypeEchantillon.values()) {
      if (typeEchantillon.getShortValue().equals(value)) {
        return typeEchantillon;
      }
    }
    throw new EnumParsingException(value, TypeEchantillon.class);
  }
}
