package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.parametre.distribution.model.ParametreDistribution;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreDistributionInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametreDistributionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ParametreDistributionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreDistributionMapper {

  ParametreDistributionMapper INSTANCE = Mappers.getMapper(ParametreDistributionMapper.class);

  ParametreDistributionDTO domainToDTO(final ParametreDistribution parametreDistribution);

  ParametreDistribution inputDTOToDomain(final CreateOrUpdateParametreDistributionInputDTO inputDTO);

  CreateOrUpdateParametreDistributionPayloadDTO domainToPayloadDTO(
      final ParametreDistribution parametreDistribution);

}
