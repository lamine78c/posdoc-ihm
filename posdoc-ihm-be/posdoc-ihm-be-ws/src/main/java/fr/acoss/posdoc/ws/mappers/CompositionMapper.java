package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.CompositionEntity;
import fr.acoss.posdoc.domain.composition.model.Composition;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateCompositionInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateCompositionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.CompositionDTO;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper
public interface CompositionMapper {

    CompositionMapper INSTANCE = Mappers.getMapper(CompositionMapper.class);

    CompositionDTO domainToDTO(final Composition composition);

    CompositionEntity domainToEntity(final Composition composition);

    Composition inputDTOToDomain(final CreateOrUpdateCompositionInputDTO compositionInputDTO);

    CreateOrUpdateCompositionPayloadDTO domainToPayloadDTO(final Composition composition);

    @AfterMapping
    default void setDefaultIsNotAuthorisedToBeDeleted(@MappingTarget CreateOrUpdateCompositionPayloadDTO payloadDTO) {
        if (payloadDTO.getIsNotAuthorisedToBeDeleted() == null) {
            payloadDTO.setIsNotAuthorisedToBeDeleted(Boolean.FALSE);
        }
    }

}
