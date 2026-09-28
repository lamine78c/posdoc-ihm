package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.destinataire.model.Destinataire;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateDestinataireInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteDestinataireInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateDestinatairePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.DestinataireDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface DestinataireMapper {

    DestinataireMapper INSTANCE = Mappers.getMapper(DestinataireMapper.class);

    DestinataireDTO domainToDTO(final Destinataire destinataire);

    Destinataire inputDTOToDomain(final CreateOrUpdateDestinataireInputDTO createOrUpdateDestinataireInputDTO);

    DestinataireCompositeIdModel inputDTOToDomain(final DeleteDestinataireInputDTO deleteDestinataireInputDTO);

    CreateOrUpdateDestinatairePayloadDTO domainToPayloadDTO(final Destinataire destinataire);

}

