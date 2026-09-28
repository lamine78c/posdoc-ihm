package fr.acoss.posdoc.database.entities;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class AdresseRetourCompositeId implements Serializable {

  @Column(name = "c30_codadr", nullable = false)
  private String code;

  @Column(name = "c30_codorg", nullable = false)
  private String codeOrganisme;

}
