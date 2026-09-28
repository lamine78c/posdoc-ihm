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

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "suppor")
public class SupportEntity {

  @Id
  @Column(name = "c18_typsup", nullable = false)
  private String type;

  @Column(name = "s18_libsup", nullable = false)
  private String libelle;

  @Column(name = "n18_poific", nullable = false)
  private Integer poids;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
