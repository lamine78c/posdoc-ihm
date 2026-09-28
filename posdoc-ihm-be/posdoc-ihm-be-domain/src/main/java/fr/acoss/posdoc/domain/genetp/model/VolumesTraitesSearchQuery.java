package fr.acoss.posdoc.domain.genetp.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class VolumesTraitesSearchQuery {

  private String codEnv;

  private List<String> codOrgs;

  private List<RessGammSite> resGamSitList;

  private String fromDate;

  private String toDate;
}
