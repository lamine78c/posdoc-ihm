package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.parametre.distribution.primary.ParametreDistributionService;
import fr.acoss.posdoc.domain.parametre.distribution.secondary.ParametreDistributionPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ParametreDistributionMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreDistributionInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametreDistributionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ParametreDistributionResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ParametreDistributionResolver.class);

    private static final ParametreDistributionMapper MAPPER = ParametreDistributionMapper.INSTANCE;

    private final ParametreDistributionPersistence parametreDistributionPersistence;

    private final ParametreDistributionService parametreDistributionService;

    public ParametreDistributionResolver(final ParametreDistributionPersistence parametreDistributionPersistence,
                                         final ParametreDistributionService parametreDistributionService) {
        this.parametreDistributionPersistence = parametreDistributionPersistence;
        this.parametreDistributionService = parametreDistributionService;
    }

    public PaginatedDTO parametresDistribution(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(parametreDistributionPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateParametreDistributionPayloadDTO> allParametresDistribution() {
        return parametreDistributionPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Fabrication > Paramètres de Distribution", action = Action.CREATE)
    public CreateOrUpdateParametreDistributionPayloadDTO createParametreDistribution(
            final CreateOrUpdateParametreDistributionInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createParametreDistribution: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(parametreDistributionService
                .createParametreDistribution(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Paramètres de Distribution", action = Action.UPDATE)
    public CreateOrUpdateParametreDistributionPayloadDTO updateParametreDistribution(
            final CreateOrUpdateParametreDistributionInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateParametreDistribution: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(parametreDistributionService
                .updateParametreDistribution(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Paramètres de Distribution", action = Action.DELETE)
    public DeletePayloadDTO deleteParametreDistributions(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteParametresDistribution: {}", deletesDTO);
        }

        parametreDistributionService.deleteParametreDistributions(deletesDTO.getIds());

        return new DeletePayloadDTO(true);
    }

}
