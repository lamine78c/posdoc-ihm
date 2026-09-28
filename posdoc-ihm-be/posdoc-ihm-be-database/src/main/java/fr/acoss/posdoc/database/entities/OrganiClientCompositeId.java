package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class OrganiClientCompositeId implements Serializable {

  @Column(name = "c110_codorg", nullable = false)
  private String codorg;

  @Column(name = "c110_codcli", nullable = false)
  private String codcli;
}
