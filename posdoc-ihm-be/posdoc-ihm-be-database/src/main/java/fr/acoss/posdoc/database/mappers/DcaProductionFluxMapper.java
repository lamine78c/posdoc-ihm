package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.DcaProductionFluxEntity;
import fr.acoss.posdoc.domain.productionflux.model.ProductionFlux;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface DcaProductionFluxMapper {

    DcaProductionFluxMapper INSTANCE = Mappers.getMapper(DcaProductionFluxMapper.class);

    ProductionFlux entityToDomain(final DcaProductionFluxEntity dcaProductionFluxEntity);

    DcaProductionFluxEntity domainToEntity(final ProductionFlux productionFlux);
}
