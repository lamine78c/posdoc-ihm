package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.imprime.model.Imprime;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateImprimeInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateImprimePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ImprimeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ImprimeMapper {

  ImprimeMapper INSTANCE = Mappers.getMapper(ImprimeMapper.class);

  ImprimeDTO domainToDTO(final Imprime imprime);

  Imprime inputDTOToDomain(final CreateOrUpdateImprimeInputDTO createOrUpdateImprimeInputDTO);

  CreateOrUpdateImprimePayloadDTO domainToPayloadDTO(final Imprime imprime);

}
