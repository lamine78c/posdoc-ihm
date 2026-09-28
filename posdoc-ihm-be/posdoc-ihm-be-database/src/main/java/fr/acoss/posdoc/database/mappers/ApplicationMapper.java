package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ApplicationEntity;
import fr.acoss.posdoc.domain.application.model.Application;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ApplicationMapper {

  ApplicationMapper INSTANCE = Mappers.getMapper(ApplicationMapper.class);

  @Mapping(source = "applicationEntity.id.codeEnvironnement", target = "codeEnvironnement")
  @Mapping(source = "applicationEntity.id.codeOrganisation", target = "codeOrganisation")
  @Mapping(source = "applicationEntity.id.code", target = "code")
  Application entityToDomain(final ApplicationEntity applicationEntity);

  @Mapping(source="application.codeEnvironnement",target="id.codeEnvironnement")
  @Mapping(source="application.codeOrganisation",target="id.codeOrganisation")
  @Mapping(source="application.code",target="id.code")
  ApplicationEntity domainToEntity(final Application application);

}
