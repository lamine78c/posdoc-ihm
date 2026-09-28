package fr.acoss.posdoc.database.entities.converters;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CoutPliConverterTest {

  private final CoutPliConverter coutPliConverter = new CoutPliConverter();

  @Test
  void convertToDatabaseColumn() {
    assertEquals(12345, coutPliConverter.convertToDatabaseColumn(12.345));
    assertEquals(12345, coutPliConverter.convertToDatabaseColumn(12.34567));
    assertEquals(14, coutPliConverter.convertToDatabaseColumn(0.0145));
    assertEquals(1, coutPliConverter.convertToDatabaseColumn(0.001));
    assertEquals(0, coutPliConverter.convertToDatabaseColumn(0.000));
    assertEquals(1003, coutPliConverter.convertToDatabaseColumn(1.003));
  }

  @Test
  void convertToEntityAttribute() {
    assertEquals(12.345, coutPliConverter.convertToEntityAttribute(12345));
    assertEquals(0.345, coutPliConverter.convertToEntityAttribute(345));
    assertEquals(0.045, coutPliConverter.convertToEntityAttribute(45));
    assertEquals(0.004, coutPliConverter.convertToEntityAttribute(4));
    assertEquals(0.000, coutPliConverter.convertToEntityAttribute(0));
  }
}