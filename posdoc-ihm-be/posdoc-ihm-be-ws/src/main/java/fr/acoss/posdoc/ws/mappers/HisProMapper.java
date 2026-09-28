package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.hispro.model.HisPro;
import fr.acoss.posdoc.ws.resolvers.query.HisProDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HisProMapper {

  HisProMapper INSTANCE = Mappers.getMapper(HisProMapper.class);

  HisProDTO domainToDTO(final HisPro hisPro);
}

