package fr.acoss.posdoc.database.entities.converters;


import fr.acoss.posdoc.types.HabilitationType;

import javax.persistence.AttributeConverter;

public class HabilitationTypeConverter  implements AttributeConverter<HabilitationType, String> {

    @Override
    public String convertToDatabaseColumn(HabilitationType attribute) {
        return attribute.getShortValue();
    }

    @Override
    public HabilitationType convertToEntityAttribute(String dbData) {
        return HabilitationType.fromValue(dbData);
    }
}
