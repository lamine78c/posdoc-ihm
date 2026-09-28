package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "sitcnp")
public class SiteCNPEntity {

  @Id
  @Column(name = "c73_codsit", nullable = false)
  private String code;

  @Column(name = "s73_hostad", nullable = false)
  private String host;

  @Column(name = "s73_userid", nullable = false)
  private String username;

  @Column(name = "s73_passwd", nullable = false)
  private String password;

  @Column(name = "s73_resdel", nullable = false)
  private String ressourceDelestage;

  @Column(name = "s73_masorg", nullable = false)
  private String organismeMassification;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
