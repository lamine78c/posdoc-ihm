package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.TarposEntity;
import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.Map;

@Mapper
public interface TarposMapper {

  TarposMapper INSTANCE = Mappers.getMapper(TarposMapper.class);


  Tarpos entityToDomain(final TarposEntity tarposEntity);

  TarposEntity domainToEntity(final Tarpos tarpos);

  default Tarpos mapToTarpos(Map<String, Object> row) {
    if (row == null) return null;

    Tarpos tarpos = new Tarpos();
    tarpos.setType((String) row.get("type"));
    tarpos.setLibelle((String) row.get("libelle"));
    tarpos.setOrdre((Integer) row.get("ordre"));
    tarpos.setTlibre(castToBoolean(row.get("tlibre")));
    tarpos.setCompta(castToBoolean(row.get("compta")));
    tarpos.setPerime(castToBoolean(row.get("perime")));
    tarpos.setIsNotAuthorisedToBeDeleted(castToBoolean(row.get("isNotAuthorisedToBeDeleted")));
    return tarpos;
  }

  default Boolean castToBoolean(Object value) {
    if (value instanceof Boolean) return (Boolean) value;
    if (value instanceof Number) return ((Number) value).intValue() != 0;
    if (value instanceof String) return Boolean.parseBoolean((String) value);
    return false;
  }
}

