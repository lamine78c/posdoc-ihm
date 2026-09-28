package fr.acoss.posdoc.database.entities;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class CommandeCompositeId implements Serializable {

  @Column(name = "c05_codenv", nullable = false)
  private String codenv;

  @Column(name = "c05_codorg", nullable = false)
  private String codorg;

  @Column(name = "c05_codapp", nullable = false)
  private String codapp;

  @Column(name = "c05_codcom", nullable = false)
  private String code;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    CommandeCompositeId that = (CommandeCompositeId) o;
    return codenv.equals(that.codenv) && codorg.equals(that.codorg) && codapp.equals(that.codapp) && code.equals(that.code);
  }

  @Override
  public int hashCode() {
    return Objects.hash(codenv, codorg, codapp, code);
  }
}
