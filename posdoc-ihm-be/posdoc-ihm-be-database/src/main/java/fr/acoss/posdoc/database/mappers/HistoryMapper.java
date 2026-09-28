package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.domain.history.model.History;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HistoryMapper {

    HistoryMapper INSTANCE = Mappers.getMapper(HistoryMapper.class);

    History entityToDomain(final HistoryEntity historyEntity);

    HistoryEntity domainToEntity(final History history);
}
