package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class GenTarCompositeId implements Serializable {
  @Column(name = "c45_codenv", nullable = false)
  private String c45Codenv;
  @Column(name = "c45_codorg", nullable = false)
  private String c45Codorg;
  @Column(name = "c45_codapp", nullable = false)
  private String c45Codapp;
  @Column(name = "c45_percod", nullable = false)
  private String c45Percod;
  @Column(name = "c45_codcom", nullable = false)
  private String c45Codcom;
  @Column(name = "c45_numcom", nullable = false)
  private String c45Numcom;
  @Column(name = "c45_codfic", nullable = false)
  private String c45Codfic;
  @Column(name = "c45_typtar", nullable = false)
  private String c45Typtar;
}