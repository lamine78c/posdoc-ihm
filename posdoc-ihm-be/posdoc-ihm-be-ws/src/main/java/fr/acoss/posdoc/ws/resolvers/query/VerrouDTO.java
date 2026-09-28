package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class VerrouDTO {

  private String code;

  private String libelle;

  private Integer maxExecution;

}
