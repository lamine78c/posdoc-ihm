package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

import javax.persistence.*;

@Filter(name = "organismeFilter", condition = "C10_Codorg in (:organisme)")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "destin")
public class DestinataireEntity {

  @EmbeddedId
  private DestinataireCompositeId id;

  @Column(name = "S10_Libdes", nullable = false)
  private String libelle;

  @Column(name = "S10_Refpri", nullable = true)
  private String refPri;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;
}
