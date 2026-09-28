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
@Table(name = "parcle")
public class ParametreEditionEntity {

  @Id
  @Column(name = "c37_refcle", nullable = false)
  private String reference;

  @Column(name = "s37_typfor", nullable = false)
  private String type;

  @Column(name = "s37_libcle", nullable = false)
  private String libelle;

  @Column(name = "n37_numlig", nullable = false)
  private Integer lineNumber;

  @Column(name = "n37_numcol", nullable = false)
  private Integer columnNumber;

  @Column(name = "n37_lgncle", nullable = false)
  private Integer length;

}
