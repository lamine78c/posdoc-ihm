package fr.acoss.posdoc.types;

import fr.acoss.posdoc.exceptions.EnumParsingException;

public enum HelpStateType {
    DRAFT("DRAFT"), ENABLED("ENABLED"), DISABLED("DISABLED");

    private String value;

    HelpStateType(final String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }

    public static HelpStateType fromValue(final String value) {
        for (final var HelpStatusType : HelpStateType.values()) {
            if (HelpStatusType.getValue().equals(value)) {
                return HelpStatusType;
            }
        }
        throw new EnumParsingException(value, HelpStateType.class);
    }
}