package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.ws.resolvers.payloads.SearchUtilogPayloadDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UtilogMapper {

    UtilogMapper INSTANCE = Mappers.getMapper(UtilogMapper.class);

    SearchUtilogPayloadDTO domainToSearchUtilogPayloadDTO(final UtiLog utiLog);
}
