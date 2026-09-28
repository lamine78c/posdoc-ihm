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
public class PapaadCompositeIdEntity implements Serializable {

  @Column(name = "c79_codcom", nullable = false)
  private String codeCommande;

  @Column(name = "c79_codfic", nullable = false)
  private String codeFichier;

  @Column(name = "c79_cnotif", nullable = false)
  private String codeNotif;
}
