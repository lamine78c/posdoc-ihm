package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "genlie")
public class GenlieEntity {

  @Id
  @Column(name = "c60_idpere", nullable = false)
  private Integer idpere;

  @Column(name = "c60_idfils", nullable = false)
  private Integer idfils;
}
