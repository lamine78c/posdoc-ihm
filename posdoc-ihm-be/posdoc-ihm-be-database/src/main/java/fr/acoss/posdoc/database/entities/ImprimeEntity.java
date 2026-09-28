package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "imprim")
public class ImprimeEntity {

  @Id
  @Column(name = "c40_refimp", nullable = false)
  private String reference;

  @Column(name = "s40_libimp", nullable = false)
  private String libelle;

  @Column(name = "s40_codrnd")
  private String codeRND;

  @Column(name = "s40_typmef", nullable = false)
  private String typeComposition;

  @Column(name = "s40_typcol", nullable = false)
  private String typeCouleur;

  @Column(name = "b40_recver", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean rectoVerso;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
