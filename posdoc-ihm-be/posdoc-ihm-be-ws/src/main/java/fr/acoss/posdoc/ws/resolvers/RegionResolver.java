package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.region.primary.RegionService;
import fr.acoss.posdoc.domain.region.secondary.RegionPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.RegionMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.*;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateRegionPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class RegionResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(RegionResolver.class);
    private static final RegionMapper MAPPER = RegionMapper.INSTANCE;

    private final RegionPersistence regionPersistence;

    private final RegionService regionService;

    public RegionResolver(final RegionPersistence regionPersistence,
                          final RegionService regionService) {
        this.regionPersistence = regionPersistence;
        this.regionService = regionService;
    }

    public PaginatedDTO regions(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(regionPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateRegionPayloadDTO> allRegions() {
        return regionPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Organismes > Régions", action = Action.CREATE)
    public CreateOrUpdateRegionPayloadDTO createRegion(final CreateOrUpdateRegionInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createRegion: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(regionService
                .createRegion(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Organismes > Régions", action = Action.UPDATE)
    public CreateOrUpdateRegionPayloadDTO updateRegion(final CreateOrUpdateRegionInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateRegion: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(regionService
                .updateRegion(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Organismes > Régions", action = Action.DELETE)
    public DeletePayloadDTO deleteRegion(final DeleteByStringIdInputDTO deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteRegion: {}", deleteDTO);
        }
        regionService.deleteRegion(deleteDTO.getId());
        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Administration > Organismes > Régions", action = Action.DELETE)
    public DeletePayloadDTO deleteRegions(final DeleteByArrayStringIdInputDTO deletesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteRegions: {}", deletesDTO);
        }
        regionService.deleteRegions(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

}
