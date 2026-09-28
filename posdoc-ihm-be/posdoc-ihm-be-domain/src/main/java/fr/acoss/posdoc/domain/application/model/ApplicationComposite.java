package fr.acoss.posdoc.domain.application.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationComposite {

  private String codeEnvironnement;
  private String codeOrganisation;
  private String code;

}
