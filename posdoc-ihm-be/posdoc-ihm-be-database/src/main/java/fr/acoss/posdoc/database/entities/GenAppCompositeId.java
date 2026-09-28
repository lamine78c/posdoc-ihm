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
public class GenAppCompositeId implements Serializable {

  @Column(name = "c14_codenv", nullable = false)
  private String codeEnv;

  @Column(name = "c14_codorg", nullable = false)
  private String codeOrg;

  @Column(name = "c14_codapp", nullable = false)
  private String codeApp;

  @Column(name = "c14_percod", nullable = false)
  private String perCod;


}
