package fr.acoss.posdoc.types;

import fr.acoss.posdoc.exceptions.EnumParsingException;

public enum ActionUtilisateur {

    INSERT("INSERT"), UPDATE("UPDATE"), DELETE("DELETE");

    private String shortValue;

    ActionUtilisateur(final String shortValue) {
        this.shortValue = shortValue;
    }

    public String getShortValue() {
        return shortValue;
    }

    public static ActionUtilisateur fromValue(final String value) {
        for (final var actionUtilisateur : ActionUtilisateur.values()) {
            if (actionUtilisateur.getShortValue().equals(value)) {
                return actionUtilisateur;
            }
        }
        throw new EnumParsingException(value, ActionUtilisateur.class);
    }

}
