package fr.acoss.posdoc.types;

import fr.acoss.posdoc.exceptions.EnumParsingException;

public enum TypeRefection {

  ACTUELS("A"), INITIAUX("I");
  private String value;

  TypeRefection(final String value) {
    this.value = value;
  }

  public String getShortValue() {
    return value;
  }

  public static TypeRefection fromValue(final String value) {
    for (final var typeRefection : TypeRefection.values()) {
      if (typeRefection.getShortValue().equals(value)) {
        return typeRefection;
      }
    }
    throw new EnumParsingException(value, TypeRefection.class);
  }
}
