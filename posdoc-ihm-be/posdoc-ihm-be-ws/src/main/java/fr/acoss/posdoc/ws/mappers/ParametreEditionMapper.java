package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.ParametreEditionEntity;
import fr.acoss.posdoc.domain.parametre.edition.model.ParametreEdition;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreEditionInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametreEditionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ParametreEditionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreEditionMapper {

    ParametreEditionMapper INSTANCE = Mappers.getMapper(ParametreEditionMapper.class);

    ParametreEditionDTO domainToDTO(final ParametreEdition parametreEdition);

    ParametreEditionEntity domainToEntity(final ParametreEdition parametreEdition);

    ParametreEdition inputDTOToDomain(final CreateOrUpdateParametreEditionInputDTO parametreEditionInputDTO);

    CreateOrUpdateParametreEditionPayloadDTO domainToPayloadDTO(final ParametreEdition parametreEdition);

}
