package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Filter(name = "organismeFilter", condition = "s56_codorg in (:organisme)")
@Entity
@Getter
@Setter
@Table(name = "gendoc")
public class GenDocEntity {

  @EmbeddedId
  private GenDocCompositeId id;

  @Column(name = "s56_codenv", nullable = false)
  private String codenv;

  @Column(name = "s56_codorg", nullable = false)
  private String codorg;

  @Column(name = "s56_codapp", nullable = false)
  private String codapp;

  @Column(name = "s56_percod", nullable = false)
  private String percod;

  @Column(name = "s56_numcom", nullable = false)
  private String numcom;

  @Column(name = "s56_codcom", nullable = false)
  private String codcom;

  @Column(name = "s56_codfic", nullable = false)
  private String codfic;

  @Column(name = "s56_coddoc", nullable = false)
  private String coddoc;

  @Column(name = "s56_refdem", nullable = false)
  private String refdem;

  @Column(name = "s56_typact", nullable = true)
  private String typact;

  @Column(name = "b56_imprim", nullable = true)
  private Boolean imprim;

  @Column(name = "s56_docsta", nullable = true)
  private String docsta;

  @Column(name = "s56_docinf", nullable = true)
  private String docinf;

  @Column(name = "d56_ddodeb", nullable = true)
  private LocalDateTime ddodeb;

  @Column(name = "d56_ddofin", nullable = false)
  private LocalDateTime ddofin;

  @Column(name = "d56_ddosus", nullable = true)
  private LocalDateTime ddosus;

  @Column(name = "n56_tpscom", nullable = false)
  private Integer tpscom;

  @Column(name = "b45_retour", nullable = false)
  private boolean retour;

  @Column(name = "d56_ddoimp", nullable = false)
  private LocalDateTime ddoimp;

  @Column(name = "d56_ddoexp", nullable = false)
  private LocalDateTime ddoexp;
}
