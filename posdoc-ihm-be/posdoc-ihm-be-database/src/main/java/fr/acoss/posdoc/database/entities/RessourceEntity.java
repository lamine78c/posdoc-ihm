package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import javax.persistence.*;

@FilterDef(
        name = "organismeRessourceFilter",
        parameters = @ParamDef(name = "organismesAndGeneric", type = "string")
)
@Filter(name = "organismeRessourceFilter", condition = "c08_codorg in (:organismesAndGeneric)")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ressou")
public class RessourceEntity {

  @EmbeddedId
  private RessourceCompositeId id;

  @Column(name = "s08_codser")
  private String codeServeur;

  @Column(name = "s08_libres")
  private String libelle;

  @Column(name = "s08_typres")
  private String type;

  @Column(name = "s08_logtrf")
  private String logicielDistribution;

  @Column(name = "s08_compro")
  private String referenceDistributionProduit;

  @Column(name = "s08_comlia")
  private String referenceDistributionProduitRecap;

  @Column(name = "s08_userid")
  private String userId;

  @Column(name="s08_passwd")
  private String password;

  @Column(name="s08_typfus")
  private String typeFusion;

  @Column(name="b08_fusdes")
  @Convert(converter = BooleanConverter.class)
  private Boolean destinataire;

  @Column(name="s08_filimp")
  private String fileImpression;

  @Column(name="s08_infuti")
  private String informationUtilisateur;

  @Column(name="b08_bloque")
  @Convert(converter = BooleanConverter.class)
  private Boolean fileBloquee;

  @Column(name="b08_resmsp")
  @Convert(converter = BooleanConverter.class)
  private Boolean miseSousPli;

  @Column(name="s08_profil")
  private String profil;

  @Transient
  private Boolean isNotAuthorisedToBeDeleted;

}
