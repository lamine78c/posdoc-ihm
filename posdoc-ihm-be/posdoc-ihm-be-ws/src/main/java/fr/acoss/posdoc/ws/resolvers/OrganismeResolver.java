package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.organisme.model.CodeOrganismeDTO;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.domain.organisme.primary.OrganismeService;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.domain.regionmapping.primary.RegionMappingService;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.OrganismeMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateOrganismePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrganismeResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrganismeResolver.class);

    private final OrganismeService organismeService;

    private static final OrganismeMapper MAPPER = OrganismeMapper.INSTANCE;

    private final OrganismePersistence organismePersistence;

    private final RegionMappingService regionMappingService;

    public OrganismeResolver(OrganismePersistence organismePersistence, OrganismeService organismeService, RegionMappingService regionMappingService) {
        this.organismePersistence = organismePersistence;
        this.organismeService = organismeService;
        this.regionMappingService = regionMappingService;
    }

    public List<CreateOrUpdateOrganismePayloadDTO> allOrganismes() {
        return organismePersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<String> getCodesOrganismesByRegions(List<String> regions) {
        return organismePersistence.organismesByRegions(regionMappingService.getRegionByCodeAnais(regions)).stream().map(Organisme::getCode).collect(Collectors.toList());
    }


    @Historisable(form = "Administration > Organismes > Organismes", action = Action.CREATE)
    public CreateOrUpdateOrganismePayloadDTO createOrganisme(final CreateOrUpdateOrganismeInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createOrganisme: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(organismeService
                .createOrganisme(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Organismes > Organismes", action = Action.UPDATE)
    public CreateOrUpdateOrganismePayloadDTO updateOrganisme(final CreateOrUpdateOrganismeInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateOrganisme: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(organismeService
                .updateOrganisme(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Organismes > Organismes", action = Action.DELETE)
    public DeletePayloadDTO deleteOrganismes(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteOrganismes: {}", deletesDTO);
        }
        organismeService.deleteOrganismes(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

    public List<CodeOrganismeDTO> findCodeOrganismesByTypeR() {
        return organismePersistence.findCodeOrganismesByTypeR().stream()
                .map(CodeOrganismeDTO::new)
                .collect(Collectors.toList());
    }
}
