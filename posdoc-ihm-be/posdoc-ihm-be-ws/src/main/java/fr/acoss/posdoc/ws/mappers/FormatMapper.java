package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.FormatEntity;
import fr.acoss.posdoc.domain.format.model.Format;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFormatInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFormatPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.FormatDTO;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FormatMapper {

  FormatMapper INSTANCE = Mappers.getMapper(FormatMapper.class);

  FormatDTO domainToDTO(final Format format);
  FormatEntity domainToEntity(final Format format);
  Format inputDTOToDomain(final CreateOrUpdateFormatInputDTO formatInputDTO);

  CreateOrUpdateFormatPayloadDTO domainToPayloadDTO(final Format format);

  @AfterMapping
  default void setDefaultIsNotAuthorisedToBeDeleted(@MappingTarget CreateOrUpdateFormatPayloadDTO payloadDTO) {
    if (payloadDTO.getIsNotAuthorisedToBeDeleted() == null) {
      payloadDTO.setIsNotAuthorisedToBeDeleted(Boolean.FALSE);
    }
  }

}
