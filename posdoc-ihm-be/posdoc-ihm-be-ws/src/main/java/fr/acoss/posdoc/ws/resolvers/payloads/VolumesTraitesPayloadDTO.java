package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class VolumesTraitesPayloadDTO {

  private String codorg;

  private String codapp;

  private String codfic;

  private String codcom;

  private String codgam;

  private String codsit;

  private String coddes;

  private String codres;

  private Integer sumpagfic;

}
