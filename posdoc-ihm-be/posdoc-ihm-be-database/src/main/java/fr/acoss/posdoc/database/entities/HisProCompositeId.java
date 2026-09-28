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
public class HisProCompositeId implements Serializable {

  @Column(name = "c23_codenv", nullable = false)
  private String codeEnv;

  @Column(name = "c23_codorg", nullable = false)
  private String codeOrg;

  @Column(name = "c23_codapp", nullable = false)
  private String codeApp;

  @Column(name = "c23_percod", nullable = false)
  private String perCod;

  @Column(name = "c23_codcom", nullable = false)
  private String codeCom;

  @Column(name = "c23_numcom", nullable = false)
  private String numCom;

  @Column(name = "c23_codfic", nullable = false)
  private String codeFic;

  @Column(name = "c23_codgam", nullable = false)
  private String codeGam;

}
