package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.gammes.primary.GammeService;
import fr.acoss.posdoc.domain.gammes.secondary.GammePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.GammesMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateGammeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.UpdateGammesInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateGammePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class GammeResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(GammeResolver.class);
    private static final GammesMapper MAPPER = GammesMapper.INSTANCE;

    private final GammePersistence gammePersistence;
    private final GammeService gammeService;

    public GammeResolver(final GammePersistence gammePersistence, final GammeService gammeService) {
        this.gammePersistence = gammePersistence;
        this.gammeService = gammeService;
    }

    public PaginatedDTO gammes(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(gammePersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateGammePayloadDTO> allGammes() {
        return gammePersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Fabrication > Gammes", action = Action.CREATE)
    public CreateOrUpdateGammePayloadDTO createGamme(final CreateOrUpdateGammeInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createGamme: {}", createDTO);
        }
        return MAPPER.domainToPayloadDTO(gammeService.createGamme(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Gammes", action = Action.UPDATE)
    public CreateOrUpdateGammePayloadDTO updateGamme(final CreateOrUpdateGammeInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateGamme: {}", updateDTO);
        }
        return MAPPER.domainToPayloadDTO(gammeService.updateGamme(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Gammes", action = Action.DELETE)
    public DeletePayloadDTO deleteGamme(final DeleteByStringIdInputDTO deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteGamme: {}", deleteDTO);
        }
        gammeService.deleteGamme(deleteDTO.getId());
        return new DeletePayloadDTO(Boolean.TRUE);
    }

    public List<CreateOrUpdateGammePayloadDTO> updateGammes(final UpdateGammesInputDTO updatesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updatesGammes: {}", updatesDTO);
        }
        var gammes = updatesDTO.getGammes().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
        return gammeService.updateGammes(gammes).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Fabrication > Gammes", action = Action.DELETE)
    public DeletePayloadDTO deleteGammes(final DeleteByArrayStringIdInputDTO deletesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteGammes: {}", deletesDTO);
        }
        gammeService.deleteGammes(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

}
