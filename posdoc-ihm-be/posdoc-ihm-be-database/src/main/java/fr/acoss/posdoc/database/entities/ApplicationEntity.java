package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.TypeRefectionConverter;
import fr.acoss.posdoc.types.TypeRefection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import javax.persistence.*;
@FilterDef(
        name = "organismeFilter",
        parameters = @ParamDef(name = "organisme", type = "string")
)

@Filter(name = "organismeFilter", condition = "c04_codorg in (:organisme)")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "applis")
public class ApplicationEntity {

  @EmbeddedId
  @AttributeOverride(name = "c04_codenv", column = @Column(name = "c04_codenv", nullable = false))
  @AttributeOverride(name = "c04_codorg", column = @Column(name = "c04_codorg", nullable = false))
  @AttributeOverride(name = "c04_codapp", column = @Column(name = "c04_codapp", nullable = false))
  private ApplicationCompositeId id;

  @Column(name = "S04_libapp")
  private String libelle;


  @Column(name = "S04_codsys")
  private String codeSystem;

  @Column(name = "S04_codgrp")
  private String codeGroupe;

  @Column(name = "S04_numlot")
  private String lotNumber;

  @Column(name = "S04_typref")
  @ColumnTransformer(write = "?::applis_typref")
  @Convert(converter = TypeRefectionConverter.class)
  //@Enumerated(EnumType.STRING)
  private TypeRefection typeRefection;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
