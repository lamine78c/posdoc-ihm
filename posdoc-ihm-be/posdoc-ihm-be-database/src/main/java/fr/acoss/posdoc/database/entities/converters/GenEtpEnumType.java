package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.GenEtpType;

public class GenEtpEnumType extends GenericPostgreSQLEnumType<GenEtpType> {
    public GenEtpEnumType() {
        super(GenEtpType.class);
    }
}