package fr.acoss.posdoc.ws.mappers;


import fr.acoss.posdoc.domain.history.model.History;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateHistoryPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.HistoryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HistoryMapper {

    HistoryMapper INSTANCE = Mappers.getMapper(HistoryMapper.class);

    HistoryDTO domainToDTO(final History history);

    CreateOrUpdateHistoryPayloadDTO domainToPayloadDTO(final History history);
}
