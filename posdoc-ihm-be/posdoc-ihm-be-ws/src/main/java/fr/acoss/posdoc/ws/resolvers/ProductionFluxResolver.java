package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.database.dao.DcaProductionFluxRepository;
import fr.acoss.posdoc.database.mappers.DcaProductionFluxMapper;
import fr.acoss.posdoc.domain.productionflux.primary.ProductionFluxService;
import fr.acoss.posdoc.ws.mappers.ProductionFluxMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateProductionFluxPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductionFluxResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProductionFluxResolver.class);

    private static final ProductionFluxMapper MAPPER = ProductionFluxMapper.INSTANCE;

    private static final DcaProductionFluxMapper MAPPERDB = DcaProductionFluxMapper.INSTANCE;

    private final ProductionFluxService productionFluxService;

    @Autowired
    DcaProductionFluxRepository repos;

    public ProductionFluxResolver(final ProductionFluxService productionFluxService) {
        this.productionFluxService = productionFluxService;
    }


    public List<CreateOrUpdateProductionFluxPayloadDTO> allProductionFlux() {

        var o = repos.getProdFluxWithdetails().stream().map(MAPPERDB::entityToDomain).collect(Collectors.toList());
        return o.stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public DeletePayloadDTO deleteProductionFlux(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteProductionFluxs: {}", deletesDTO);
        }
        productionFluxService.deleteProductionFlux(deletesDTO.getIds().stream().map(Integer::valueOf).collect(Collectors.toList()));
        return new DeletePayloadDTO(true);
    }
}
