package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Filter(name = "organismeFilter", condition = "c00_codorg in (:organisme)")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "organi")
public class OrganismeEntity {

  @Id
  @Column(name = "c00_codorg", nullable = false)
  private String code;

  @Column(name = "s00_liborg", nullable = false)
  private String libelle;

  @Column(name = "s00_adres1")
  private String adresse1;

  @Column(name = "s00_adres2")
  private String adresse2;

  @Column(name = "s00_adres3")
  private String adresse3;

  @Column(name = "s00_adres4")
  private String adresse4;

  @Column(name = "s00_typorg", nullable = false)
  private String type;

  @Column(name = "s00_codreg")
  private String codeRegion;

  @Column(name = "s00_codsit")
  private String codeSite;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
