package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenBonEntity;
import fr.acoss.posdoc.domain.genbon.model.GenBon;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenBonMapper {

  GenBonMapper INSTANCE = Mappers.getMapper(GenBonMapper.class);

  GenBon entityToDomain(final GenBonEntity genBonEntity);

  GenBonEntity domainToEntity(final GenBon genBon);

}

