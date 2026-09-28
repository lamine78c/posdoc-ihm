package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tarpos")
public class TarposEntity {

  @Id
  @Column(name = "c43_typtar", nullable = false)
  private String type;

  @Column(name = "s43_libtar", nullable = false)
  private String libelle;

  @Column(name = "n43_ordtar", nullable = false)
  private Integer ordre;

  @Column(name = "b43_tlibre", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean tlibre;

  @Column(name = "b43_compta", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean compta;

  @Column(name = "b43_perime", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean perime;

}
