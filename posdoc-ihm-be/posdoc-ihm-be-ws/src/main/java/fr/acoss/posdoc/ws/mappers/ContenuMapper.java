package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.contenu.model.Contenu;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateContenuInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateContenuPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ContenuDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ContenuMapper {

    ContenuMapper INSTANCE = Mappers.getMapper(ContenuMapper.class);

    ContenuDTO domainToDTO(final Contenu contenu);

    Contenu inputDTOToDomain(final CreateOrUpdateContenuInputDTO createOrUpdateContenuInputDTO);

    CreateOrUpdateContenuPayloadDTO domainToPayloadDTO(final Contenu contenu);

}
