package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.FaqStatus;

public class FaqStatusEnumType extends GenericPostgreSQLEnumType<FaqStatus> {
    public FaqStatusEnumType() {
        super(FaqStatus.class);
    }
}
