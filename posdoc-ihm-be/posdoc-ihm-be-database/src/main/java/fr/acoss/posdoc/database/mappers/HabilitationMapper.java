package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.HabilitationEntity;
import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HabilitationMapper {

    HabilitationMapper INSTANCE = Mappers.getMapper(HabilitationMapper.class);

    Habilitation entityToDomain(final HabilitationEntity habilitationEntity);

    HabilitationEntity domainToEntity(final Habilitation habilitation);
}
