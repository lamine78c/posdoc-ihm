package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.region.model.Region;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateRegionInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateRegionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.RegionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface RegionMapper {

  RegionMapper INSTANCE = Mappers.getMapper(RegionMapper.class);

  RegionDTO domainToDTO(final Region region);

  Region inputDTOToDomain(final CreateOrUpdateRegionInputDTO createOrUpdateRegionInputDTO);

  CreateOrUpdateRegionPayloadDTO domainToPayloadDTO(final Region region);

}
