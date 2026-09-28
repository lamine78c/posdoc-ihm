package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.SupportEntity;
import fr.acoss.posdoc.domain.support.model.Support;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface SupportMapper {

  SupportMapper INSTANCE = Mappers.getMapper(SupportMapper.class);

  Support entityToDomain(final SupportEntity supportEntity);

  SupportEntity domainToEntity(final Support support);

}
