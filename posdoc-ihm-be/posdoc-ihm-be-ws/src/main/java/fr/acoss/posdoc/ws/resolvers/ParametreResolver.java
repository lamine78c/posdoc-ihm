package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.domain.parametre.model.Parametre;
import fr.acoss.posdoc.domain.parametre.primary.ParametreService;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ParametreMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametrePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ParametreResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ParametreResolver.class);

    private static final ParametreMapper MAPPER = ParametreMapper.INSTANCE;

    private final ParametrePersistence parametrePersistence;

    private final ParametreService parametreService;

    public ParametreResolver(final ParametrePersistence parametrePersistence,
                             final ParametreService parametreService) {
        this.parametrePersistence = parametrePersistence;
        this.parametreService = parametreService;
    }

    public PaginatedDTO parametres(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(parametrePersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateParametrePayloadDTO> allParametres() {
        return parametrePersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Moteur Adelaïde", action = Action.CREATE)
    public CreateOrUpdateParametrePayloadDTO createParametre(
            final CreateOrUpdateParametreInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createParametre: {}", createDTO);
        }

        final var parametre = parametreService.createParametre(MAPPER.inputDTOToDomain(createDTO));

        return MAPPER.domainToPayloadDTO(parametre);
    }

    @Historisable(form = "Administration > Moteur Adelaïde", action = Action.UPDATE)
    public CreateOrUpdateParametrePayloadDTO updateParametre(
            final CreateOrUpdateParametreInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateParametre: {}", updateDTO);
        }

        final var parametre = parametreService.updateParametre(MAPPER.inputDTOToDomain(updateDTO));

        return MAPPER.domainToPayloadDTO(parametre);
    }

    @Historisable(form = "Administration > Moteur Adelaïde", action = Action.DELETE)
    public DeletePayloadDTO deleteParametre(final DeleteByStringIdInputDTO deleteDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteParametre: {}", deleteDTO);
        }

        parametreService.deleteParametre(deleteDTO.getId());

        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Administration > Moteur Adelaïde", action = Action.DELETE)
    public DeletePayloadDTO deleteParametres(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteParametres: {}", deletesDTO);
        }
        parametreService.deleteParametres(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

    public List<Parametre> getParamsForMasappMasgamMasuti() {
        return parametrePersistence.getParamsForMasappMasgamMasuti();
    }

    public String getCodeOrgOGUR() {
        return parametrePersistence.getValueByCode(ParamsUtils.OGUORG);
    }

    public String getValueDocDematerialises() {
        return parametrePersistence.getValueDocDematerialises();
    }
}
