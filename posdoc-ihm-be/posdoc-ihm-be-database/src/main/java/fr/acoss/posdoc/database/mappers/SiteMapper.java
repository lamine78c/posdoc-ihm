package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.SiteCNPEntity;
import fr.acoss.posdoc.database.entities.SiteOrganismeEntity;
import fr.acoss.posdoc.domain.site.model.SiteCNP;
import fr.acoss.posdoc.domain.site.model.SiteOrganisme;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface SiteMapper {

  SiteMapper INSTANCE = Mappers.getMapper(SiteMapper.class);

  SiteCNP entityToDomain(final SiteCNPEntity siteCNPEntity);
  SiteOrganisme entityToDomain(final SiteOrganismeEntity siteOrganisme);

  SiteCNPEntity domainToEntity(final SiteCNP siteCNP);
  SiteOrganismeEntity domainToEntity(final SiteOrganisme siteOrganisme);

}
