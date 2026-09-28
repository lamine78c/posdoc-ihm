package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.support.primary.SupportService;
import fr.acoss.posdoc.domain.support.secondary.SupportPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.PaginatedMapper;
import fr.acoss.posdoc.ws.mappers.SearchParametersMapper;
import fr.acoss.posdoc.ws.mappers.SupportMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateSupportInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateSupportPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import graphql.kickstart.tools.GraphQLMutationResolver;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SupportResolver implements GraphQLQueryResolver, GraphQLMutationResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(SupportResolver.class);

    private static final SupportMapper MAPPER = SupportMapper.INSTANCE;

    private static final PaginatedMapper PA_MAPPER = PaginatedMapper.INSTANCE;

    private static final SearchParametersMapper SEARCH_MAPPER = SearchParametersMapper.INSTANCE;

    private final SupportPersistence supportPersistence;

    private final SupportService supportService;

    public SupportResolver(final SupportPersistence supportPersistence,
                           SupportService supportService) {
        this.supportPersistence = supportPersistence;
        this.supportService = supportService;
    }

    public PaginatedDTO supports(final QueryParametersInputDTO parameters) {

        return PA_MAPPER.paginatedToPaginatedDTO(supportPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(parameters)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateSupportPayloadDTO> allSupports() {
        return supportPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Spécification de fichiers > Supports", action = Action.CREATE)
    public CreateOrUpdateSupportPayloadDTO createSupport(
            final CreateOrUpdateSupportInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createSupport: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(supportService
                .createSupport(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Supports", action = Action.UPDATE)
    public CreateOrUpdateSupportPayloadDTO updateSupport(
            final CreateOrUpdateSupportInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateSupport: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(supportService
                .updateSupport(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Spécification de fichiers > Supports", action = Action.DELETE)
    public DeletePayloadDTO deleteSupports(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteSupports: {}", deletesDTO);
        }
        supportService.deleteSupports(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

}
