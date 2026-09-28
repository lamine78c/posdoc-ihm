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
public class GenProCompositeId implements Serializable {

  @Column(name = "c16_codenv", nullable = false)
  private String codeEnv;

  @Column(name = "c16_codorg", nullable = false)
  private String codeOrg;

  @Column(name = "c16_codapp", nullable = false)
  private String codeApp;

  @Column(name = "c16_percod", nullable = false)
  private String perCod;

  @Column(name = "c16_codcom", nullable = false)
  private String codeCom;

  @Column(name = "c16_numcom", nullable = false)
  private String numCom;

  @Column(name = "c16_codfic", nullable = false)
  private String codeFic;

  @Column(name = "c16_codgam", nullable = false)
  private String codeGam;

}
