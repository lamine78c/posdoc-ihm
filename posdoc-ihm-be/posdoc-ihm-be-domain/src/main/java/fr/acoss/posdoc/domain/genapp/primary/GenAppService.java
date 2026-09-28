package fr.acoss.posdoc.domain.genapp.primary;

import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.genfic.model.OccurenceApplication;
import fr.acoss.posdoc.domain.occurrence.application.model.SearchOccurrenceApplicationInput;

import java.util.List;

public class GenAppService {
  private final GenAppPersistence genAppPersistence;

  public GenAppService(final GenAppPersistence genAppPersistence) {
    this.genAppPersistence = genAppPersistence;
  }

  public List<OccurenceApplication> searchOccurencePerApplication(final SearchOccurrenceApplicationInput input) {
    if(input.getCodSit() == null) {
      return getOccurenceApplicationsWithoutSite(input);
    }else {
      return getOccurenceApplicationsWithSite(input);
    }
  }

  private List<OccurenceApplication> getOccurenceApplicationsWithSite(final SearchOccurrenceApplicationInput input) {
    if(Boolean.TRUE.equals(input.getExt())) {
      return getOccurenceApplicationsWithSiteExt(input);
    }else {
      return getOccurenceApplicationsWithSiteNoExt(input);
    }
  }

  private List<OccurenceApplication> getOccurenceApplicationsWithSiteNoExt(SearchOccurrenceApplicationInput input) {
    if(input.getTri().equals("DATE")) {
      return this.genAppPersistence.searchOccurenceNonExtPerApplicationOrderByDate(input);
    }else {
      return this.genAppPersistence.searchOccurenceNonExtPerApplication(input);
    }
  }

  private List<OccurenceApplication> getOccurenceApplicationsWithSiteExt(SearchOccurrenceApplicationInput input) {
    if(input.getTri().equals("DATE")) {
      return this.genAppPersistence.searchOccurenceExtPerApplicationOrderByDate(input);
    }else {
      return this.genAppPersistence.searchOccurenceExtPerApplication(input);
    }
  }

  private List<OccurenceApplication> getOccurenceApplicationsWithoutSite(SearchOccurrenceApplicationInput input) {
    if(input.getTri().equals("DATE")) {
      return this.genAppPersistence.searchOccurenceNonSitePerApplicationOrderByDate(input);
    }else {
      return this.genAppPersistence.searchOccurenceNonSitePerApplication(input);
    }
  }
}
