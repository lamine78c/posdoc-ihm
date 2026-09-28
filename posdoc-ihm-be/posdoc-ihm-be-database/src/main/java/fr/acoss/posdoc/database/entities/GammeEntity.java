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
@Table(name = "gammes")
public class GammeEntity {

  @Id
  @Column(name = "c06_codgam", nullable = false)
  private String code;

  @Column(name = "s06_libgam", nullable = false)
  private String libelle;

  @Column(name = "s06_codver")
  private String codeVerrou;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
