package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.PathHabiliEntity;
import fr.acoss.posdoc.domain.pathhabili.model.PathHabili;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = HabilitationMapper.class)
public interface PathHabiliMapper {

  PathHabiliMapper INSTANCE = Mappers.getMapper(PathHabiliMapper.class);

  @Mapping(source = "pathHabiliEntity.habilitationEntity", target = "habilitation")
  PathHabili entityToDomain(
      final PathHabiliEntity pathHabiliEntity);

  @Mapping(source = "pathHabili.habilitation", target = "habilitationEntity")
  PathHabiliEntity domainToEntity(
      final PathHabili pathHabili);

}
