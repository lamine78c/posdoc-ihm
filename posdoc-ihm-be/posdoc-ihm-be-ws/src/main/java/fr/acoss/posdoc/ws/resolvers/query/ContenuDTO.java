package fr.acoss.posdoc.ws.resolvers.query;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ContenuDTO {

  private Integer id;

  private String titre;

  private LocalDateTime dateActivation;

  private LocalDateTime dateExpiration;

  private String message;

  private List<RegionDTO> regions;

}
