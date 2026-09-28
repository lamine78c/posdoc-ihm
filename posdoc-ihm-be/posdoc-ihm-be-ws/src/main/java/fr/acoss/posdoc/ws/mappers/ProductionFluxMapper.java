package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.productionflux.model.ProductionFlux;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateProductionFluxPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ProductionFluxDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ProductionFluxMapper {

  ProductionFluxMapper INSTANCE = Mappers.getMapper(ProductionFluxMapper.class);

  ProductionFluxDTO domainToDTO(final ProductionFlux productionFlux);

  ProductionFlux inputDTOToDomain(final CreateOrUpdateProductionFluxPayloadDTO createOrUpdateProductionFluxPayloadDTO);

  CreateOrUpdateProductionFluxPayloadDTO domainToPayloadDTO(final ProductionFlux productionFlux);

}
