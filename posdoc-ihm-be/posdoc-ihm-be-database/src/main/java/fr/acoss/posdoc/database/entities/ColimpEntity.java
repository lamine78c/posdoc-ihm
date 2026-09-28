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
@Table(name = "colimp")
public class ColimpEntity {

  @Id
  @Column(name = "c25_typcol", nullable = false)
  private String typcol;

  @Column(name = "s25_libcol", nullable = false)
  private String libcol;

}
