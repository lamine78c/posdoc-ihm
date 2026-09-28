package fr.acoss.posdoc.domain.region.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Region {

  private String code;

  private String libelle;

  private Boolean isNotAuthorisedToBeDeleted;

}
