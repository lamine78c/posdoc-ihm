package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateOrganismePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.OrganismeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface OrganismeMapper {

  OrganismeMapper INSTANCE = Mappers.getMapper(OrganismeMapper.class);

  OrganismeDTO domainToDTO(final Organisme organisme);

  Organisme inputDTOToDomain(final CreateOrUpdateOrganismeInputDTO createOrUpdateOrganismeInputDTO);

  CreateOrUpdateOrganismePayloadDTO domainToPayloadDTO(final Organisme organisme);
}
