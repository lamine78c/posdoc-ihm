package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateParametrePayloadDTO {

  private String code;

  private String value;

  private String libelle;

}
