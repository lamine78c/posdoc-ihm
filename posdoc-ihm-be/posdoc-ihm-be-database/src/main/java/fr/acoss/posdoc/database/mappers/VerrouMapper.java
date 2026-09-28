package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.VerrouEntity;
import fr.acoss.posdoc.domain.verrou.model.Verrou;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface VerrouMapper {

  VerrouMapper INSTANCE = Mappers.getMapper(VerrouMapper.class);

  Verrou entityToDomain(final VerrouEntity verrouEntity);

  VerrouEntity domainToEntity(final Verrou verrou);

}
