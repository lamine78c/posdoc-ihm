package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.stainf.model.StaInf;
import fr.acoss.posdoc.ws.resolvers.query.StaInfDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface StaInfMapper {

  StaInfMapper INSTANCE = Mappers.getMapper(StaInfMapper.class);

  StaInfDTO domainToDTO(final StaInf staInf);
}
