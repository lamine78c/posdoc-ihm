package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.parametre.model.Parametre;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametrePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ParametreDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreMapper {

  ParametreMapper INSTANCE = Mappers.getMapper(ParametreMapper.class);

  ParametreDTO domainToDTO(final Parametre parametre);

  CreateOrUpdateParametrePayloadDTO domainToPayloadDTO(final Parametre parametre);

  Parametre inputDTOToDomain(final CreateOrUpdateParametreInputDTO parametreInputDTO);

}
