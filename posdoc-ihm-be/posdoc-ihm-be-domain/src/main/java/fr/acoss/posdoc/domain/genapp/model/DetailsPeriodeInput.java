package fr.acoss.posdoc.domain.genapp.model;

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
public class DetailsPeriodeInput {
  private String codEnv;
  private List<String> codOrgs;
  private String codApp;
  private Boolean isManuel;
}
