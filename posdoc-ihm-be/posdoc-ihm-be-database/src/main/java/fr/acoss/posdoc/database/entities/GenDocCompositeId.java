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
public class GenDocCompositeId implements Serializable {

  @Column(name = "c56_datdem", nullable = false)
  private String datdem;

  @Column(name = "c56_numdem", nullable = false)
  private Integer numdem;

}
