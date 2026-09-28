package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@FilterDef(
        name = "organismeFilter",
        parameters = @ParamDef(name = "organisme", type = "string")
)

@Filter(name = "organismeFilter", condition = "c110_codorg in (:organisme)")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "organi_client_snv2")
public class OrganiClientEntity {

  @EmbeddedId
  @AttributeOverride(name = "c110_codorg", column = @Column(name = "c110_codorg", nullable = false))
  @AttributeOverride(name = "c110_codcli", column = @Column(name = "c110_codcli", nullable = false))
  private OrganiClientCompositeId id;
}
