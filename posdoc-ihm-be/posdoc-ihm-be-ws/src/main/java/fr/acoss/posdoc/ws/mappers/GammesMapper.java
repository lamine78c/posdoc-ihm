package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.gammes.model.Gamme;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateGammeInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateGammePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.GammeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GammesMapper {

  GammesMapper INSTANCE = Mappers.getMapper(GammesMapper.class);

  GammeDTO domainToDTO(final Gamme gamme);

  Gamme inputDTOToDomain(final CreateOrUpdateGammeInputDTO inputDTO);

  CreateOrUpdateGammePayloadDTO domainToPayloadDTO(final Gamme gamme);

}
