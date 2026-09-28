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
@Table(name = "params")
public class ParametreEntity {

  @Id
  @Column(name = "c32_codpar", nullable = false)
  private String code;

  @Column(name = "s32_valpar", nullable = false)
  private String value;

  @Column(name = "s32_libpar")
  private String libelle;

}
