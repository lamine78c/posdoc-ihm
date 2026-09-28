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
public class RessourceCompositeId implements Serializable {

  @Column(name = "c08_codenv", nullable = false)
  private String codeEnvironnement;

  @Column(name = "c08_codorg", nullable = false)
  private String codeOrganisme;

  @Column(name = "c08_codapp", nullable = false)
  private String codeApplication;

  @Column(name = "c08_codgam", nullable = false)
  private String codeGamme;

  @Column(name = "c08_codsit", nullable = false)
  private String codeSite;

  @Column(name = "c08_codres", nullable = false)
  private String codeRessource;

}
