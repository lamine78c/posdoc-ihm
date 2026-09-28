package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SupportDTO {

  private String type;

  private String libelle;

  private Integer poids;

}
