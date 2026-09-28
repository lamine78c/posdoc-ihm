package fr.acoss.posdoc.types;

import fr.acoss.posdoc.exceptions.EnumParsingException;

public enum TypeSignature {
  R("R"), V("V"), SPACE("");

  private String shortValue;

  TypeSignature(final String shortValue) {
    this.shortValue = shortValue;
  }

  public String getShortValue() {
    return shortValue;
  }

  public static TypeSignature fromValue(final String value) {
    for (final var typSig : TypeSignature.values()) {
      if (typSig.getShortValue().equals(value)) {
        return typSig;
      }
    }
    throw new EnumParsingException(value, TypeSignature.class);
  }

}
