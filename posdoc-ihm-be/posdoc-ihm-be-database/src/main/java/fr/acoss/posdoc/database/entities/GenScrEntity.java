package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "genscr")
public class GenScrEntity {

  @EmbeddedId
  private GenScrCompositeId id;

  @Column(name = "s41_signal", nullable = false)
  private String signal;

  @Column(name = "s41_script", nullable = false)
  private String script;

  @Column(name = "s41_mesano", nullable = false)
  private String mesano;

  @Column(name = "s41_ficinf", nullable = false)
  private String ficinf;

  @Column(name = "d41_dcreat", nullable = false)
  private LocalDateTime dcreat;

  @Column(name = "n41_idetap", nullable = false)
  private Integer idetap;
}
