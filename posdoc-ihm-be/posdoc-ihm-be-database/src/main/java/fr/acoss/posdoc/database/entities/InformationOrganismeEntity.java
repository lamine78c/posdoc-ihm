package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "info_organisme")
public class InformationOrganismeEntity {

  @Id
  @SequenceGenerator(name = "info_organisme_seq", allocationSize = 1)
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "info_organisme_seq")
  @Column(name = "info_organisme_id", nullable = false)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "code_organisme", nullable = false, updatable = false)
  private OrganismeEntity organismeEntity;

  @Column(name = "message", nullable = false)
  private String message;

  @Column(name = "actif", nullable = false)
  private Boolean actif;

  @Column(name = "date", nullable = false)
  private LocalDateTime date;

}
