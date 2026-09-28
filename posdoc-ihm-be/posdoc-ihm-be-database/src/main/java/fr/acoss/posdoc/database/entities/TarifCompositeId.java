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
public class TarifCompositeId implements Serializable {

  @Column(name = "c44_typtar", nullable = false)
  private String type;

  @Column(name = "c44_numtar", nullable = false)
  private String numero;

}
