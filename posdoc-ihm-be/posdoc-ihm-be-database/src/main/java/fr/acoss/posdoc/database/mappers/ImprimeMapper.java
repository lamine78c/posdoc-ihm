package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ImprimeEntity;
import fr.acoss.posdoc.domain.imprime.model.Imprime;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ImprimeMapper {

  ImprimeMapper INSTANCE = Mappers.getMapper(ImprimeMapper.class);

  Imprime entityToDomain(final ImprimeEntity imprimeEntity);

  ImprimeEntity domainToEntity(final Imprime imprime);

}
