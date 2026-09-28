package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.MyslogAction;

public class MyslogEnumAction extends GenericPostgreSQLEnumType<MyslogAction> {
    public MyslogEnumAction() {
        super(MyslogAction.class);
    }
}