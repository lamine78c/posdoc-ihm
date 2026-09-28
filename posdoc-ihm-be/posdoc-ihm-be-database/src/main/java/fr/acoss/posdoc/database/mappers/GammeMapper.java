package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GammeEntity;
import fr.acoss.posdoc.domain.gammes.model.Gamme;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GammeMapper {

  GammeMapper INSTANCE = Mappers.getMapper(GammeMapper.class);

  Gamme entityToDomain(final GammeEntity gammeEntity);

  GammeEntity domainToEntity(final Gamme gamme);

}

