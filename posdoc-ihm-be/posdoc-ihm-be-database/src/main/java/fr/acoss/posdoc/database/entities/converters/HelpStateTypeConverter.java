package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.HelpStateType;

import javax.persistence.AttributeConverter;

public class HelpStateTypeConverter implements AttributeConverter<HelpStateType, String> {

  @Override
  public String convertToDatabaseColumn(HelpStateType helpStateType) {
    return helpStateType.getValue();
  }

  @Override
  public HelpStateType convertToEntityAttribute(String dbData) {
    return HelpStateType.fromValue(dbData);
  }
}