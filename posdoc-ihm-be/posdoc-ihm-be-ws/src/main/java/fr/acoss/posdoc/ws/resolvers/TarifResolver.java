package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.tarif.primary.TarifService;
import fr.acoss.posdoc.domain.tarif.secondary.TarifPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.TarifMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateTarifDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteTarifInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.UpdateTarifDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateTarifPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TarifResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(TarifResolver.class);

    private static final TarifMapper MAPPER = TarifMapper.INSTANCE;

    private final TarifService tarifService;

    private final TarifPersistence tarifPersistence;

    public TarifResolver(TarifPersistence tarifPersistence, TarifService tarifService) {
        this.tarifPersistence = tarifPersistence;
        this.tarifService = tarifService;
    }

    public PaginatedDTO tarifs(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(tarifPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateTarifPayloadDTO> allTarifs() {
        return tarifPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Tarifs > Details", action = Action.CREATE)
    public CreateOrUpdateTarifPayloadDTO createTarif(final CreateTarifDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createTarif: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(tarifService.createTarif(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Tarifs > Details", action = Action.UPDATE)
    public CreateOrUpdateTarifPayloadDTO updateTarif(final UpdateTarifDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateTarif: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(tarifService.updateTarif(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Tarifs > Details", action = Action.DELETE)
    public DeletePayloadDTO deleteTarifs(List<DeleteTarifInputDTO> deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteTarifs: {}", deletesDTO);
        }

        tarifService.deleteTarifs(deletesDTO.stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList()));

        return new DeletePayloadDTO(true);
    }

    public List<CreateOrUpdateTarifPayloadDTO> getTarifsById(String type) {
        return tarifPersistence.selectByType(type).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

}
