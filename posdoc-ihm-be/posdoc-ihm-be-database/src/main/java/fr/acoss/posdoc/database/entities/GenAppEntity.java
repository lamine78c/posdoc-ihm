package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import fr.acoss.posdoc.database.entities.converters.TypeRefectionConverter;
import fr.acoss.posdoc.types.TypeRefection;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "genapp")
public class GenAppEntity {

  @EmbeddedId
  private GenAppCompositeId id;

  @Column(name = "s14_appsta", nullable = false)
  private String appsta = "";

  @Column(name = "s14_appinf")
  private String appinf;

  @Column(name = "b14_arefec", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean arefec = false;

  @Column(name = "d14_dapplc")
  private LocalDateTime dapplc;

  @Column(name = "d14_dappld")
  private LocalDateTime dappld;

  @Column(name = "d14_dapplt")
  private LocalDateTime dapplt;

  @Column(name = "d14_dappls")
  private LocalDateTime dappls;

  @Column(name = "d14_dapplh")
  private LocalDateTime dapplh;

  @Column(name = "s14_typref", nullable = false)
  @ColumnTransformer(write = "?::genapp_typref")
  @Convert(converter = TypeRefectionConverter.class)
  private TypeRefection typref = TypeRefection.INITIAUX;

  @Column(name = "b14_manuel", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean manuel = false;

  @Column(name = "s14_sitori")
  private String sitori;

}
