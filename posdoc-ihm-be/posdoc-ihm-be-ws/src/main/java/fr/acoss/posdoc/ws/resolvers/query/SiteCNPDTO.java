package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class SiteCNPDTO {

  private String code;

  private String host;

  private String username;

  private String password;

  private String ressourceDelestage;

  private String organismeMassification;

}
