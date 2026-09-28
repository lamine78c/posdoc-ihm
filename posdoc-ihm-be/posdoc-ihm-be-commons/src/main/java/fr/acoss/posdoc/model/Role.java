package fr.acoss.posdoc.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public enum Role {
    NAT_CONSULTATION,
    NAT_ADMINISTRATEUR,
    CNE,
    GESTION,
    UNKNOWN;

    private static final Logger LOGGER = LoggerFactory.getLogger(Role.class);

    public static Role fromString(String roleString) {
        if (roleString == null) {
            return UNKNOWN;
        }
        String trimmedRoleString = roleString.trim();
        for (Role role : values()) {
            if (role.name().equalsIgnoreCase(trimmedRoleString)) {
                return role;
            }
        }

        LOGGER.warn("Role.fromString: Unknown role string: {}", roleString);

        return UNKNOWN;
    }

    @Override
    public String toString() {
        return name();
    }
}
