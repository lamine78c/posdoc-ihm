package fr.acoss.posdoc.domain.site.primary;

import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.domain.site.model.SiteCNP;
import fr.acoss.posdoc.domain.site.model.SiteOrganisme;
import fr.acoss.posdoc.domain.site.secondary.SiteCNPPersistence;
import fr.acoss.posdoc.domain.site.secondary.SiteOrganismePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.site.validators.SiteValidators.*;

public class SiteService {

  private final SiteCNPPersistence siteCNPPersistence;

  private final SiteOrganismePersistence siteOrganismePersistence;
  private final OrganismePersistence organismePersistence;

  public SiteService(
          final SiteCNPPersistence siteCNPPersistence,
          final SiteOrganismePersistence siteOrganismePersistence,
          final OrganismePersistence organismePersistence
  ) {

    this.siteCNPPersistence = siteCNPPersistence;
    this.siteOrganismePersistence = siteOrganismePersistence;
    this.organismePersistence = organismePersistence;
  }

  public SiteCNP createSiteCNP(final SiteCNP siteCNP) {

    //TODO Controle sur la présence des id ?

    codeSiteCNPValidator().validate(siteCNP.getCode());
    hostValidator().validate(siteCNP.getHost());
    usernameValidator().validate(siteCNP.getUsername());
    passwordValidator().validate(siteCNP.getPassword());
    ressourceDelestageValidator().validate(siteCNP.getRessourceDelestage());
    organismeMassificationValidator().validate(siteCNP.getOrganismeMassification());

    if (siteCNPPersistence.exists(siteCNP.getCode())) {
      throw new AlreadyExistingElement("SiteCNP", siteCNP.getCode());
    }

    return siteCNPPersistence.create(siteCNP);
  }

  public SiteOrganisme createSiteOrganisme(final SiteOrganisme siteOrganisme) {

    //TODO Controle sur la présence des id ?
    codeOrganismeValidator().validate(siteOrganisme.getCodeOrganisme());
    codeSiteDematValidator().validate(siteOrganisme.getCodeSiteDematerialisation());
    codeSiteProdocsValidator().validate(siteOrganisme.getCodeSiteProdocs());

    if (siteOrganismePersistence.exists(siteOrganisme.getCodeOrganisme())) {
      throw new AlreadyExistingElement("SiteOrganisme", siteOrganisme.getCodeOrganisme());
    }

    return siteOrganismePersistence.create(siteOrganisme);
  }

  public SiteCNP updateSiteCNP(final SiteCNP siteCNP) {

    codeSiteCNPValidator().validate(siteCNP.getCode());
    hostValidator().validate(siteCNP.getHost());
    usernameValidator().validate(siteCNP.getUsername());
    passwordValidator().validate(siteCNP.getPassword());
    ressourceDelestageValidator().validate(siteCNP.getRessourceDelestage());
    organismeMassificationValidator().validate(siteCNP.getOrganismeMassification());

    if (!siteCNPPersistence.exists(siteCNP.getCode())) {
      throw new ElementNotFoundException("SiteCNP", siteCNP.getCode());
    }

    return siteCNPPersistence.create(siteCNP);
  }

  public SiteOrganisme updateSiteOrganisme(final SiteOrganisme siteOrganisme) {

    codeOrganismeValidator().validate(siteOrganisme.getCodeOrganisme());
    codeSiteDematValidator().validate(siteOrganisme.getCodeSiteDematerialisation());
    codeSiteProdocsValidator().validate(siteOrganisme.getCodeSiteProdocs());

    if (!siteOrganismePersistence.exists(siteOrganisme.getCodeOrganisme())) {
      throw new ElementNotFoundException("SiteOrganisme", siteOrganisme.getCodeOrganisme());
    }

    return siteOrganismePersistence.create(siteOrganisme);
  }

  public void deleteSiteCNP(final String code) {
    siteCNPPersistence.delete(code);
  }

  public void deleteSitesCNP(List<String> siteCodes) {
    // vérification dépendance Organisme
    List<String> listOrg = organismePersistence.sitesExistsInOrganismes(siteCodes);
    if (!listOrg.isEmpty()) {
      throw new StileExistingElement("Site", siteCodes, "Organisme");
    }
    siteCNPPersistence.deleteAll(siteCodes);
  }

  public void deleteSiteOrganisme(final String code) {
    siteOrganismePersistence.delete(code);
  }

}
