package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ParametreEntity;
import fr.acoss.posdoc.domain.parametre.model.Parametre;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreMapper {

  ParametreMapper INSTANCE = Mappers.getMapper(ParametreMapper.class);

  Parametre entityToDomain(final ParametreEntity parametreEntity);

  ParametreEntity domainToEntity(final Parametre parametre);

}
