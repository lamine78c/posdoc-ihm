package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "sitorg")
public class SiteOrganismeEntity {

  @Id
  @Column(name = "c74_codorg", nullable = false)
  private String codeOrganisme;

  @Column(name = "s74_sitatt", nullable = false)
  private String codeSiteDematerialisation;

  @Column(name = "s74_sitscr", nullable = false)
  private String codeSiteProdocs;

}
