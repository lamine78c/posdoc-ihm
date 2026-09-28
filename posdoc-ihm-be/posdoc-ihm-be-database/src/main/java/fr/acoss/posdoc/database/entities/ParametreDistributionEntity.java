package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "parres")
public class ParametreDistributionEntity {

  @Id
  @Column(name = "c36_refdis", nullable = false)
  private String reference;

  @Column(name = "s36_libdis", nullable = false)
  private String libelle;

  @Column(name = "s36_logtrf", nullable = false)
  private String logicielDistribution;

  @Column(name = "s36_comdis")
  private String commandeDistribution;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
