package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@Table(name = "produi")
public class ProduiEntity {

  @EmbeddedId
  private ProduiCompositeId id;

  @Column(name = "b09_proact", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private boolean proact;

}
