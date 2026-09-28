package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.OrganismeEntity;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface OrganismeMapper {

  OrganismeMapper INSTANCE = Mappers.getMapper(OrganismeMapper.class);

  Organisme entityToDomain(final OrganismeEntity organismeEntity);

  OrganismeEntity domainToEntity(final Organisme organisme);

}
