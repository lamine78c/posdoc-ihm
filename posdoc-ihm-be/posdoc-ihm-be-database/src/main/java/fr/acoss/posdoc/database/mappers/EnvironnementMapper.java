package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.EnvironnementEntity;
import fr.acoss.posdoc.domain.environnement.model.Environnement;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface EnvironnementMapper {

  EnvironnementMapper INSTANCE = Mappers.getMapper(EnvironnementMapper.class);

  Environnement entityToDomain(final EnvironnementEntity environnementEntity);

  EnvironnementEntity domainToEntity(final Environnement environnement);

}
