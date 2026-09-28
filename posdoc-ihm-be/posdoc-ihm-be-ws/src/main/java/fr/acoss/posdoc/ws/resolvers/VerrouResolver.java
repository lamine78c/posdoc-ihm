package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.verrou.primary.VerrouService;
import fr.acoss.posdoc.domain.verrou.secondary.VerrouPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.VerrouMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateVerrouInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateVerrouPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VerrouResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(VerrouResolver.class);

    private static final VerrouMapper MAPPER = VerrouMapper.INSTANCE;

    private final VerrouPersistence verrouPersistence;

    private final VerrouService verrouService;

    public VerrouResolver(final VerrouPersistence verrouPersistence,
                          final VerrouService verrouService) {
        this.verrouPersistence = verrouPersistence;
        this.verrouService = verrouService;
    }

    public PaginatedDTO verrous(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(verrouPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateVerrouPayloadDTO> allVerrous() {
        return verrouPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Fabrication > Verrous", action = Action.CREATE)
    public CreateOrUpdateVerrouPayloadDTO createVerrou(final CreateOrUpdateVerrouInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createVerrou: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(verrouService
                .createVerrou(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Verrous", action = Action.UPDATE)
    public CreateOrUpdateVerrouPayloadDTO updateVerrou(final CreateOrUpdateVerrouInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateVerrou: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(verrouService
                .updateVerrou(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Verrous", action = Action.DELETE)
    public DeletePayloadDTO deleteVerrous(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteVerrous: {}", deletesDTO);
        }

        verrouService.deleteVerrous(deletesDTO.getIds());

        return new DeletePayloadDTO(Boolean.TRUE);
    }

}
