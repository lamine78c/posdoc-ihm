package fr.acoss.posdoc.domain.client.model;

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
public class Client {

  private String code;

  private String libelle;

  private String codeAlliage;

  private Boolean isNotAuthorisedToBeDeleted;

}
