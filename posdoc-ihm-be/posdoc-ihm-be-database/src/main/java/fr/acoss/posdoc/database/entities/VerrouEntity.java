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
@Table(name = "verrou")
public class VerrouEntity {

  @Id
  @Column(name = "c75_codver", nullable = false)
  private String code;

  @Column(name = "s75_libver", nullable = false)
  private String libelle;

  @Column(name = "n75_maxexe")
  private Integer maxExecution;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
