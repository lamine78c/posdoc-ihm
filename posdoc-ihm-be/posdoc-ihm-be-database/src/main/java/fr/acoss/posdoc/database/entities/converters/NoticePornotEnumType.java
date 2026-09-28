package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.NoticePornotType;

public class NoticePornotEnumType extends GenericPostgreSQLEnumType<NoticePornotType> {
    public NoticePornotEnumType() {
        super(NoticePornotType.class);
    }
}