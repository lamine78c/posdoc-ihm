package fr.acoss.posdoc.domain.informationorganisme.model;

import fr.acoss.posdoc.domain.organisme.model.Organisme;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class InformationOrganisme {

  private Integer id;

  private Organisme organisme;

  private String message;

  private Boolean actif;

  private LocalDateTime date;

}
