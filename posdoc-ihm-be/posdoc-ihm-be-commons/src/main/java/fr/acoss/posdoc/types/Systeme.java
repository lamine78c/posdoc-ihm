package fr.acoss.posdoc.types;

import fr.acoss.posdoc.exceptions.EnumParsingException;

public enum Systeme {
  WINDOWS("W"), AIX("A"), LINUX("L");

  private String shortValue;

  Systeme(final String shortValue) {
    this.shortValue = shortValue;
  }

  public String getShortValue() {
    return shortValue;
  }

  public static Systeme fromValue(final String value) {
    for (final var systeme : Systeme.values()) {
      if (systeme.getShortValue().equals(value)) {
        return systeme;
      }
    }
    throw new EnumParsingException(value, Systeme.class);
  }

}
