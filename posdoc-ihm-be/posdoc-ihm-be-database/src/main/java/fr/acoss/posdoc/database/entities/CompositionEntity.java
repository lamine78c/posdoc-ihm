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
@Table(name = "compos")
public class CompositionEntity {


  @Id
  @Column(name = "C20_Typmef", nullable = false)
  private String code;

  @Column(name = "S20_Libmef", nullable = false)
  private String libelle;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;


}
