package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.environnement.model.Environnement;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateEnvironnementInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateEnvironnementPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.EnvironnementDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface EnvironnementMapper {

  EnvironnementMapper INSTANCE = Mappers.getMapper(EnvironnementMapper.class);

  EnvironnementDTO domainToDTO(final Environnement environnement);

  Environnement inputDTOToDomain(final CreateOrUpdateEnvironnementInputDTO environnementDTO);

  CreateOrUpdateEnvironnementPayloadDTO domainToPayloadDTO(final Environnement environnement);

}

