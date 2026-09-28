package fr.acoss.posdoc.types;

import fr.acoss.posdoc.exceptions.EnumParsingException;

public enum HabilitationType {

    MENU("M"), SOUS_MENU("S"), FORMULAIRE("F"), CONTROLE("C");

    private String shortValue;

    HabilitationType(final String shortValue) {
        this.shortValue = shortValue;
    }

    public String getShortValue() {
        return shortValue;
    }

    public static HabilitationType fromValue(final String value) {
        for (final var HabilitationType : HabilitationType.values()) {
            if (HabilitationType.getShortValue().equals(value)) {
                return HabilitationType;
            }
        }
        throw new EnumParsingException(value, HabilitationType.class);
    }
}
