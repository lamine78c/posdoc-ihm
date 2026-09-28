package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.ressource.model.Ressource;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateRessourceInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateRessourcePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.RessourceDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface RessourceMapper {

  RessourceMapper INSTANCE = Mappers.getMapper(RessourceMapper.class);

  RessourceDTO domainToDTO(final Ressource ressource);

  Ressource inputDTOToDomain(final CreateOrUpdateRessourceInputDTO createOrUpdateRessourceInputDTO);

  CreateOrUpdateRessourcePayloadDTO domainToPayloadDTO(final Ressource ressource);
}
