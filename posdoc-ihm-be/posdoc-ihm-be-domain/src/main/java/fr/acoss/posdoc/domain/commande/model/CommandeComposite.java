package fr.acoss.posdoc.domain.commande.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CommandeComposite {

  private String codenv;

  private String codorg;

  private String codapp;

  private String code;
}
