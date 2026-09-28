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
@Table(name = "compos")
public class ComposEntity {

  @Id
  @Column(name = "c20_typmef", nullable = false)
  private String typmef;

  @Column(name = "s20_libmef", nullable = false)
  private String libmef;

}
