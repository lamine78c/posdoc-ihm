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
@Table(name = "region")
public class RegionEntity {

  @Id
  @Column(name = "c62_codreg", nullable = false)
  private String code;

  @Column(name = "s62_libreg", nullable = false)
  private String libelle;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
