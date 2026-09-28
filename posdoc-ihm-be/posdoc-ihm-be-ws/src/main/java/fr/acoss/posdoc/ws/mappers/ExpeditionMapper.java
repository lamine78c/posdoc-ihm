package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.expedition.model.Expedition;
import fr.acoss.posdoc.ws.resolvers.query.ExpeditionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ExpeditionMapper {

  ExpeditionMapper INSTANCE = Mappers.getMapper(ExpeditionMapper.class);

  ExpeditionDTO domainToDTO(final Expedition expedition);
}
