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
public class ProduiCompositeId implements Serializable {

  @Column(name = "c09_codenv", nullable = false)
  private String codenv;

  @Column(name = "c09_codorg", nullable = false)
  private String codorg;

  @Column(name = "c09_codapp", nullable = false)
  private String codapp;

  @Column(name = "c09_codcom", nullable = false)
  private String codcom;

  @Column(name = "c09_codfic", nullable = false)
  private String codfic;

  @Column(name = "c09_codgam", nullable = false)
  private String codgam;

}
