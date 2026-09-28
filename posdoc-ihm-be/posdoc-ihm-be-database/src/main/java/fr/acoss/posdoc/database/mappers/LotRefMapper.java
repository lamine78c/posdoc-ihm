package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.LotRefEntity;
import fr.acoss.posdoc.domain.lotref.model.LotRef;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface LotRefMapper {

  LotRefMapper INSTANCE = Mappers.getMapper(LotRefMapper.class);

  LotRef entityToDomain(final LotRefEntity lotRefEntity);

  LotRefEntity domainToEntity(final LotRef lotRef);

}
