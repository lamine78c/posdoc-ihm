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
public class ApplicationCompositeId implements Serializable {

  @Column(name = "C04_codenv", nullable = false)
  private String codeEnvironnement;


  @Column(name = "C04_codorg", nullable = false)
  private String codeOrganisation;


  @Column(name = "C04_codapp", nullable = false)
  private String code;

}
