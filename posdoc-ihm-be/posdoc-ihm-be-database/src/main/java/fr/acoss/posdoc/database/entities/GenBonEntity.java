package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "genbon")
public class GenBonEntity {

  @Id
  @Column(name = "c80_clebon", nullable = false)
  private String clebon;

  @Column(name = "s80_codbon")
  private String codbon;
}
