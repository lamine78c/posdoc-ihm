package fr.acoss.posdoc.domain.site.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SiteCNP {

  private String code;

  private String host;

  private String username;

  private String password;

  private String ressourceDelestage;

  private String organismeMassification;

  private Boolean isNotAuthorisedToBeDeleted;

}
