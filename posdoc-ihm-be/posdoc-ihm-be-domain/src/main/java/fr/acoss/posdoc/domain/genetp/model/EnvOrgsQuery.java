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
public class EnvOrgsQuery {
  private String codeEnv;
  private List<String> codesOrg;
}
