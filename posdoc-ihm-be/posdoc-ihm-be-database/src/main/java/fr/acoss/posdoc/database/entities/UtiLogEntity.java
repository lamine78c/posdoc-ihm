package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "utilog")
public class UtiLogEntity {
  @Id
  @SequenceGenerator(name = "utilog_c69_codulo_seq", allocationSize = 1)
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "utilog_c69_codulo_seq")
  @Column(name = "c69_codulo")
  private Integer codulo;

  @Column(name = "s69_codsta", nullable = false)
  private String codsta;

  @Column(name = "s69_codusr", nullable = false)
  private String codusr;

  @Column(name = "s69_formid", nullable = false)
  private String formid;

  @Column(name = "d69_datulo")
  private LocalDateTime datulo;

  @Column(name = "s69_action", nullable = false)
  private String action;

  @Column(name = "s69_params")
  private String params;

  @Column(name = "b69_result", nullable = false, columnDefinition = "SMALLINT")
  @Convert(converter = BooleanConverter.class)
  private Boolean result;

  @Column(name = "s69_erreur")
  private String erreur;

  @Column(name = "s69_versio", nullable = true)
  private String versio;

}
