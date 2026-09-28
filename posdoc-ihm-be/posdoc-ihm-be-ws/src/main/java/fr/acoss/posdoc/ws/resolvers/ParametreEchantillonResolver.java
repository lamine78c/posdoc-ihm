package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.parametre.echantillon.primary.ParametreEchantillonService;
import fr.acoss.posdoc.domain.parametre.echantillon.secondary.ParametreEchantillonPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ParametreEchantillonMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreEchantillonInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametreEchantillonPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ParametreEchantillonResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ParametreEchantillonResolver.class);

    private static final ParametreEchantillonMapper MAPPER = ParametreEchantillonMapper.INSTANCE;

    private final ParametreEchantillonPersistence parametreEchantillonPersistence;

    private final ParametreEchantillonService parametreEchantillonService;

    public ParametreEchantillonResolver(
            final ParametreEchantillonPersistence parametreEchantillonPersistence,
            final ParametreEchantillonService parametreEchantillonService) {
        this.parametreEchantillonPersistence = parametreEchantillonPersistence;
        this.parametreEchantillonService = parametreEchantillonService;
    }

    public List<CreateOrUpdateParametreEchantillonPayloadDTO> allParametresEchantillon() {
        return parametreEchantillonPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public PaginatedDTO parametresEchantillon(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(parametreEchantillonPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    @Historisable(form = "Administration > Spécification de fichiers > Echantillons", action = Action.CREATE)
    public CreateOrUpdateParametreEchantillonPayloadDTO createParametreEchantillon(
            final CreateOrUpdateParametreEchantillonInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createParametreEchantillon: {}", createDTO);
        }

        final var parametre = parametreEchantillonService.createParametreEchantillon(MAPPER
                .inputDTOToDomain(createDTO));

        return MAPPER.domainToPayloadDTO(parametre);
    }

    @Historisable(form = "Administration > Spécification de fichiers > Echantillons", action = Action.UPDATE)
    public CreateOrUpdateParametreEchantillonPayloadDTO updateParametreEchantillon(
            final CreateOrUpdateParametreEchantillonInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateParametreEchantillon: {}", updateDTO);
        }

        final var parametre = parametreEchantillonService.updateParametreEchantillon(MAPPER
                .inputDTOToDomain(updateDTO));

        return MAPPER.domainToPayloadDTO(parametre);
    }

    @Historisable(form = "Administration > Spécification de fichiers > Echantillons", action = Action.DELETE)
    public DeletePayloadDTO deleteParametreEchantillons(final DeleteByArrayStringIdInputDTO deleteDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteParametreEchantillon: {}", deleteDTO);
        }

        parametreEchantillonService.deleteParametreEchantillons(deleteDTO.getIds());

        return new DeletePayloadDTO(Boolean.TRUE);
    }

}
