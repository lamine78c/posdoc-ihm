package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ProduiDTO {
  private String codenv;
  private String codorg;
  private String codapp;
  private String codcom;
  private String codfic;
  private String codgam;
  private boolean proact;
}
