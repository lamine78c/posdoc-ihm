package fr.acoss.posdoc.domain.commande.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommandeForCompare {
  private String application;
  private String organisme;
  private String sortHelper;
  private String codeReg;
  private String environnements;
}