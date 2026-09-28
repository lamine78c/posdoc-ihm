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
@Table(name = "client")
public class ClientEntity {

  @Id
  @Column(name = "c47_codcli", nullable = false)
  private String code;

  @Column(name = "s47_libcli", nullable = false)
  private String libelle;

  @Column(name = "s47_codalg", nullable = false)
  private String codeAlliage;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
