package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.site.model.SiteCNP;
import fr.acoss.posdoc.domain.site.model.SiteOrganisme;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateSiteCNPInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateSiteOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateSiteCNPPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateSiteOrganismePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.SiteCNPDTO;
import fr.acoss.posdoc.ws.resolvers.query.SiteOrganismeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface SiteMapper {

  SiteMapper INSTANCE = Mappers.getMapper(SiteMapper.class);

  SiteCNPDTO domainToDTO(final SiteCNP siteCNP);

  SiteOrganismeDTO domainToDTO(final SiteOrganisme siteOrganisme);

  CreateOrUpdateSiteCNPPayloadDTO domainToPayloadDTO(final SiteCNP siteCNP);

  CreateOrUpdateSiteOrganismePayloadDTO domainToPayloadDTO(final SiteOrganisme siteOrganisme);

  SiteCNP inputDTOToDomain(final CreateOrUpdateSiteCNPInputDTO siteCNPInputDTO);

  SiteOrganisme inputDTOToDomain(final CreateOrUpdateSiteOrganismeInputDTO siteOrganismeInputDTO);

}
