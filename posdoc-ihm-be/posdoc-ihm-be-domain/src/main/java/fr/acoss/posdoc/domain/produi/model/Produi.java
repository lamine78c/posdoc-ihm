package fr.acoss.posdoc.domain.produi.model;

import lombok.*;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Produi {

  private String codenv;

  private String codorg;

  private String codapp;

  private String codcom;

  private String codfic;

  private String codgam;

  private boolean proact;
}
