package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import fr.acoss.posdoc.database.entities.converters.TypeEchantillonConverter;
import fr.acoss.posdoc.types.TypeEchantillon;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

import javax.persistence.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "parech")
public class ParametreEchantillonEntity {

  @Id
  @Column(name = "c38_refech", nullable = false)
  private String reference;

  @Column(name = "s38_typech", nullable = false)
  @ColumnTransformer(write = "?::parech_typech")
  @Convert(converter = TypeEchantillonConverter.class)
  private TypeEchantillon type;

  @Column(name = "n38_nbrlot")
  private Integer nombreLots;

  @Column(name = "n38_nbrpag")
  private Integer nombrePages;

  @Column(name = "b38_random", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean random;

  @Column(name = "s38_formul")
  private String formule;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
