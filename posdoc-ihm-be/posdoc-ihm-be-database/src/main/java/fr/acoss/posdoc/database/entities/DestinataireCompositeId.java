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
public class DestinataireCompositeId implements Serializable {

  @Column(name = "C10_Coddes", nullable = false)
  private String code;

  @Column(name = "C10_Codorg", nullable = false)
  private String codeOrg;

}
