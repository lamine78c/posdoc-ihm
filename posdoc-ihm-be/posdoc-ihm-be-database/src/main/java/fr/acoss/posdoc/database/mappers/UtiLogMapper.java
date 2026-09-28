package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.UtiLogEntity;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UtiLogMapper {
  UtiLogMapper INSTANCE = Mappers.getMapper(UtiLogMapper.class);
  UtiLog entityToDomain(final UtiLogEntity utiLogEntity);
  UtiLogEntity domainToEntity(final UtiLog utiLog);
}
