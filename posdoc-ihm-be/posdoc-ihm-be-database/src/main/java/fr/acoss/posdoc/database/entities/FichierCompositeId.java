package fr.acoss.posdoc.database.entities;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class FichierCompositeId implements Serializable {

  @Column(name = "c07_codenv", nullable = false)
  private String codeEnv;

  @Column(name = "c07_codorg", nullable = false)
  private String codeOrg;

  @Column(name = "c07_codapp", nullable = false)
  private String codeApp;

  @Column(name = "c07_codcom", nullable = false)
  private String codeCom;

  @Column(name = "c07_codfic", nullable = false)
  private String codeFich;
}
