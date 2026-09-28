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
@Table(name = "stadoc")
public class StaDocEntity {

  @Id
  @Column(name = "c72_docinf", nullable = false)
  private String docinf;

  @Column(name = "s72_libinf", nullable = false)
  private String libinf;

}
