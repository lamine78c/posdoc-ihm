package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.ApplicationEntity;
import fr.acoss.posdoc.domain.application.model.Application;
import fr.acoss.posdoc.domain.application.model.ApplicationRess;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateApplicationInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateApplicationPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ApplicationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ApplicationMapper {

  ApplicationMapper INSTANCE = Mappers.getMapper(ApplicationMapper.class);

  ApplicationDTO domainToDTO(final Application application);

  ApplicationEntity domainToEntity(final Application application);

  CreateOrUpdateApplicationPayloadDTO domainToPayloadDTO(final Application application);

  CreateOrUpdateApplicationPayloadDTO domainToPayloadDTO(final ApplicationRess application);


  Application inputDTOToDomain(final CreateOrUpdateApplicationInputDTO applicationInputDTO);
}

