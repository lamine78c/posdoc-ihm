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
public class GenScrCompositeId implements Serializable {

  @Column(name = "c41_codenv", nullable = false)
  private String codeEnv;

  @Column(name = "c41_codorg", nullable = false)
  private String codeOrg;

  @Column(name = "c41_codapp", nullable = false)
  private String codeApp;

  @Column(name = "c41_percod", nullable = false)
  private String perCod;

  @Column(name = "c41_numscr", nullable = false)
  private String numScr;
}
