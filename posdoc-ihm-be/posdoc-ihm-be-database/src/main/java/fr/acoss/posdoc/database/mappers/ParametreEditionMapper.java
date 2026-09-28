package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ParametreEditionEntity;
import fr.acoss.posdoc.domain.parametre.edition.model.ParametreEdition;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreEditionMapper {

  ParametreEditionMapper INSTANCE = Mappers.getMapper(ParametreEditionMapper.class);

  ParametreEdition entityToDomain(final ParametreEditionEntity parametreEditionEntity);

  ParametreEditionEntity domainToEntity(final ParametreEdition parametreEdition);

}
