package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import fr.acoss.posdoc.database.entities.converters.GenEtpEnumType;
import fr.acoss.posdoc.types.GenEtpType;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.LocalDateTime;

import static fr.acoss.posdoc.types.TypeFusion.ETPFUS_TIRET;
import static fr.acoss.posdoc.types.Statut.CREE;
import static fr.acoss.posdoc.types.Constantes.STEPNO_0;

@Filter(name = "organismeFilter", condition = "s59_codorg in (:organisme)")
@Entity
@Getter
@Setter
@Table(name = "genetp")
@TypeDef(name = "pgsql_enum_genetp", typeClass = GenEtpEnumType.class)
public class GenEtpEntity {

  @Id
  @SequenceGenerator(name = "genetp_c59_idetap_seq", allocationSize = 1)
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "genetp_c59_idetap_seq")
  @Column(name = "C59_idetap", nullable = false)
  private Integer id;

  @Type(type = "pgsql_enum_genetp")
  @Enumerated(EnumType.STRING)
  @Column(name = "s59_typetp", nullable = false)
  private GenEtpType typetp = GenEtpType.DEB;

  @Column(name = "s59_codenv", nullable = false)
  private String codenv = "";

  @Column(name = "s59_codorg", nullable = false)
  private String codorg = "";

  @Column(name = "s59_codapp", nullable = false)
  private String codapp = "";

  @Column(name = "S59_percod", nullable = false)
  private String percod = "";

  @Column(name = "s59_codcom", nullable = false)
  private String codcom = "";

  @Column(name = "s59_numcom", nullable = false)
  private String numcom = "";

  @Column(name = "s59_codfic", nullable = false)
  private String codfic = "";

  @Column(name = "s59_codgam")
  private String codgam;

  @Column(name = "s59_numexe")
  private String numexe;

  @Column(name = "s59_codres")
  private String codres;

  @Column(name = "s59_codsit")
  private String codsit;

  @Column(name = "s59_coddes")
  private String coddes;

  @Column(name = "n59_nbrexe", nullable = false)
  private Integer nbrexe = 0;

  @Column(name = "s59_codser")
  private String codser;

  @Column(name = "s59_codsig", nullable = false)
  private String codsig = "-";

  @Column(name = "s59_signal", nullable = false)
  private String signal = "-";

  @Column(name = "b59_reedit", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean reedit = false;

  @Column(name = "b59_fabsim", nullable = false)
  @Convert(converter = BooleanConverter.class)
  private Boolean fabsim = false;

  @Column(name = "s59_statut", nullable = false)
  private String statut = CREE;

  @Column(name = "n59_codinf")
  private Integer codinf;

  @Column(name = "d59_create")
  private LocalDateTime create;

  @Column(name = "d59_valide")
  private LocalDateTime valide;

  @Column(name = "d59_debute")
  private LocalDateTime debute;

  @Column(name = "d59_termin")
  private LocalDateTime termin;

  @Column(name = "d59_invali")
  private LocalDateTime invali;

  @Column(name = "d59_suspen")
  private LocalDateTime suspen;

  @Column(name = "d59_histor")
  private LocalDateTime histor;

  @Column(name = "s59_script")
  private String script;

  @Column(name = "n59_stepno", nullable = false)
  private Integer stepno = STEPNO_0;

  @Column(name = "n59_numpid", nullable = false)
  private Integer numpid = 0;

  @Column(name = "s59_etpfus", nullable = false)
  private String etpfus = ETPFUS_TIRET;

  @Column(name = "s59_clefus")
  private String clefus;

  @Column(name = "n59_idtfus", nullable = false)
  private Integer idtfus = 0;

}
