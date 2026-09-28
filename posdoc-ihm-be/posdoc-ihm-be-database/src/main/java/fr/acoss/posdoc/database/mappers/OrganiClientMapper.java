package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.OrganiClientEntity;
import fr.acoss.posdoc.domain.organiclient.model.OrganiClient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface OrganiClientMapper {

  OrganiClientMapper INSTANCE = Mappers.getMapper(OrganiClientMapper.class);

  @Mapping(source = "id.codorg", target = "codorg")
  @Mapping(source = "id.codcli", target = "codcli")
  OrganiClient entityToDomain(final OrganiClientEntity organiClientEntity);

  @Mapping(source = "organiClient.codorg", target = "id.codorg")
  @Mapping(source = "organiClient.codcli", target = "id.codcli")
  OrganiClientEntity domainToEntity(final OrganiClient organiClient);

}
