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
public class ExemplaireCompositeId implements Serializable {

  @Column(name = "c11_codenv", nullable = false)
  private String codenv;

  @Column(name = "c11_codorg", nullable = false)
  private String codorg;

  @Column(name = "c11_codapp", nullable = false)
  private String codapp;

  @Column(name = "c11_codcom", nullable = false)
  private String codcom;

  @Column(name = "c11_codfic", nullable = false)
  private String codfic;

  @Column(name = "c11_codgam", nullable = false)
  private String codgam;

  @Column(name = "c11_numexe", nullable = false)
  private String numexe;

}
