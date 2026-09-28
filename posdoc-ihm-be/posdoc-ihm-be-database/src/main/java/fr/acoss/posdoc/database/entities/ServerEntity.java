package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import fr.acoss.posdoc.database.entities.converters.SystemeConverter;
import fr.acoss.posdoc.types.Systeme;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "server")
public class ServerEntity {

  @Id
  @Column(name = "c03_codser", nullable = false)
  private String code;

  @Column(name = "s03_codsys", nullable = false)
  @Convert(converter = SystemeConverter.class)
  private Systeme systeme;

  @Column(name = "s03_libser", nullable = false)
  private String libelle;

  @Column(name = "s03_adreip")
  private String adresseIp;

  @Column(name = "b03_sertst", nullable = false, columnDefinition = "SMALLINT")
  @Convert(converter = BooleanConverter.class)
  private Boolean teste;

  @Column(name = "b03_seract", nullable = false, columnDefinition = "SMALLINT")
  @Convert(converter = BooleanConverter.class)
  private Boolean actif;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
