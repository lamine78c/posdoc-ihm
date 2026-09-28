package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.MultifEntity;
import fr.acoss.posdoc.domain.multif.model.Multif;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateMultifInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateMultifPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.MultifDTO;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MultifMapper {

  MultifMapper INSTANCE = Mappers.getMapper(MultifMapper.class);

  MultifDTO domainToDTO(final Multif multif);
  MultifEntity domainToEntity(final Multif multif);
  Multif inputDTOToDomain(final CreateOrUpdateMultifInputDTO multifInputDTO);

  CreateOrUpdateMultifPayloadDTO domainToPayloadDTO(final Multif multif);

  @AfterMapping
  default void setDefaultIsNotAuthorisedToBeDeleted(@MappingTarget CreateOrUpdateMultifPayloadDTO payloadDTO) {
    if (payloadDTO.getIsNotAuthorisedToBeDeleted() == null) {
      payloadDTO.setIsNotAuthorisedToBeDeleted(Boolean.FALSE);
    }
  }

}
