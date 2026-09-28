package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.InformationOrganismeEntity;
import fr.acoss.posdoc.domain.informationorganisme.model.InformationOrganisme;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = OrganismeMapper.class)
public interface InformationOrganismeMapper {

  InformationOrganismeMapper INSTANCE = Mappers.getMapper(InformationOrganismeMapper.class);

  @Mapping(source = "informationOrganismeEntity.organismeEntity", target = "organisme")
  InformationOrganisme entityToDomain(
      final InformationOrganismeEntity informationOrganismeEntity);

  @Mapping(source = "informationOrganisme.organisme", target = "organismeEntity")
  InformationOrganismeEntity domainToEntity(
      final InformationOrganisme informationOrganisme);

}
