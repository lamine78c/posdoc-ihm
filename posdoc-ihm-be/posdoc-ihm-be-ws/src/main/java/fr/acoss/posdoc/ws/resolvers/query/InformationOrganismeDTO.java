package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class InformationOrganismeDTO {

  private Integer id;

  private OrganismeDTO organisme;

  private String message;

  private Boolean actif;

  private LocalDateTime date;

}
