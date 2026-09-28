package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.HelpEntity;
import fr.acoss.posdoc.domain.help.model.Help;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HelpMapper {

    HelpMapper INSTANCE = Mappers.getMapper(HelpMapper.class);

    Help entityToDomain(final HelpEntity helpEntity);

    HelpEntity domainToEntity(final Help help);
}
