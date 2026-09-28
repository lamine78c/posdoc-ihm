package fr.acoss.posdoc.ws.resolvers.payloads;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrUpdateContenuPayloadDTO {

  private Integer id;

  private String titre;

  private LocalDateTime dateActivation;

  private LocalDateTime dateExpiration;

  private String message;

  private List<CreateOrUpdateRegionPayloadDTO> regions;

}
