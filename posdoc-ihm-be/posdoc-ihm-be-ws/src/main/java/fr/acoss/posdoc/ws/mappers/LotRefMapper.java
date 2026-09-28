package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.LotRefEntity;
import fr.acoss.posdoc.domain.lotref.model.LotRef;
import fr.acoss.posdoc.ws.resolvers.query.LotRefDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface LotRefMapper {

  LotRefMapper INSTANCE = Mappers.getMapper(LotRefMapper.class);

  LotRefDTO domainToDTO(final LotRef lotRef);

  LotRefEntity domainToEntity(final LotRef lotRef);
}

