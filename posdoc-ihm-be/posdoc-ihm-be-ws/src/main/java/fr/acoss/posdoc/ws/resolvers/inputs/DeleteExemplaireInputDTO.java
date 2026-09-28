package fr.acoss.posdoc.ws.resolvers.inputs;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DeleteExemplaireInputDTO {

  private String codenv;

  private String codorg;

  private String codapp;

  private String codcom;

  private String codfic;

  private String codgam;

  private String numexe;

  private String codres;

  private String codsit;

}
