package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.site.primary.SiteService;
import fr.acoss.posdoc.domain.site.secondary.SiteCNPPersistence;
import fr.acoss.posdoc.domain.site.secondary.SiteOrganismePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.SiteMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateSiteCNPInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateSiteOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateSiteCNPPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateSiteOrganismePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SitesResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(SitesResolver.class);

    private static final SiteMapper MAPPER = SiteMapper.INSTANCE;

    final SiteCNPPersistence siteCNPPersistence;

    final SiteOrganismePersistence siteOrganismePersistence;

    final SiteService siteService;

    public SitesResolver(final SiteCNPPersistence siteCNPPersistence,
                         final SiteOrganismePersistence siteOrganismePersistence,
                         final SiteService siteService) {
        this.siteCNPPersistence = siteCNPPersistence;
        this.siteOrganismePersistence = siteOrganismePersistence;
        this.siteService = siteService;
    }

    public PaginatedDTO sitesCNP(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(siteCNPPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateSiteCNPPayloadDTO> allSitesCNP() {
        return siteCNPPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public PaginatedDTO sitesOrganisme(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(siteOrganismePersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateSiteOrganismePayloadDTO> allSitesOrganisme() {
        return siteOrganismePersistence.selectAll().stream()
                .map(MAPPER::domainToPayloadDTO)
                .collect(Collectors.toList());
    }


    @Historisable(form = "Administration > Organismes > Sites", action = Action.CREATE)
    public CreateOrUpdateSiteCNPPayloadDTO createSiteCNP(final CreateOrUpdateSiteCNPInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createSiteCNP: {}", createDTO);
        }
        return MAPPER.domainToPayloadDTO(siteService.createSiteCNP(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Organismes > Sites", action = Action.CREATE)
    public CreateOrUpdateSiteOrganismePayloadDTO createSiteOrganisme(final CreateOrUpdateSiteOrganismeInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createSiteOrganisme: {}", createDTO);
        }
        return MAPPER.domainToPayloadDTO(siteService.createSiteOrganisme(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Organismes > Sites", action = Action.UPDATE)
    public CreateOrUpdateSiteCNPPayloadDTO updateSiteCNP(final CreateOrUpdateSiteCNPInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateSiteCNP: {}", updateDTO);
        }
        return MAPPER.domainToPayloadDTO(siteService.updateSiteCNP(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Organismes > Sites", action = Action.UPDATE)
    public CreateOrUpdateSiteOrganismePayloadDTO updateSiteOrganisme(final CreateOrUpdateSiteOrganismeInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateSiteOrganisme: {}", updateDTO);
        }
        return MAPPER.domainToPayloadDTO(siteService
                .updateSiteOrganisme(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Organismes > Sites", action = Action.DELETE)
    public DeletePayloadDTO deleteSiteCNP(final DeleteByStringIdInputDTO deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteSiteCNP: {}", deleteDTO);
        }
        siteService.deleteSiteCNP(deleteDTO.getId());
        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Administration > Organismes > Sites", action = Action.DELETE)
    public DeletePayloadDTO deleteSitesCNP(final DeleteByArrayStringIdInputDTO deletesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteSitesCNP: {}", deletesDTO);
        }
        siteService.deleteSitesCNP(deletesDTO.getIds());
        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Administration > Organismes > Sites", action = Action.DELETE)
    public DeletePayloadDTO deleteSiteOrganisme(final DeleteByStringIdInputDTO deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteSiteOrganisme: {}", deleteDTO);
        }
        siteService.deleteSiteOrganisme(deleteDTO.getId());
        return new DeletePayloadDTO(Boolean.TRUE);
    }

}
