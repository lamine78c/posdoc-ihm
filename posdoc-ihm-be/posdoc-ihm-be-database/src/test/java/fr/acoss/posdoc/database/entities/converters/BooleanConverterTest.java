package fr.acoss.posdoc.database.entities.converters;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class BooleanConverterTest {

  private final BooleanConverter converter = new BooleanConverter();

  @Test
  void convertToDatabaseColumn() {
    assertNull(converter.convertToDatabaseColumn(null));
    assertEquals(1, converter.convertToDatabaseColumn(Boolean.TRUE));
    assertEquals(0, converter.convertToDatabaseColumn(Boolean.FALSE));
  }

  @Test
  void convertToEntityAttribute() {
    assertNull(converter.convertToEntityAttribute(null));
    assertEquals(Boolean.FALSE, converter.convertToEntityAttribute(0));
    assertEquals(Boolean.TRUE, converter.convertToEntityAttribute(1));
  }
}