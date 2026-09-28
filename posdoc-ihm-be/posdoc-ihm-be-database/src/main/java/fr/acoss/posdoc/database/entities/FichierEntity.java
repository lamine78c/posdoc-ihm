package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.Filter;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@Filter(name = "organismeFilter", condition = "c07_codorg in (:organisme)")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "fichie")
public class FichierEntity {

    @EmbeddedId

    @AttributeOverride(name = "c07_codenv", column = @Column(name = "c07_codenv", nullable = false))
    @AttributeOverride(name = "c07_codorg", column = @Column(name = "c07_codorg", nullable = false))
    @AttributeOverride(name = "c07_codapp", column = @Column(name = "c07_codapp", nullable = false))
    @AttributeOverride(name = "c07_codcom", column = @Column(name = "c07_codcom", nullable = false))
    @AttributeOverride(name = "c07_codfic", column = @Column(name = "c07_codfic", nullable = false))
    private FichierCompositeId id;

    @Column(name = "s07_typfor")
    private String typeFormat;

    @Column(name = "s07_typsup")
    private String typeSupport;

    @Column(name = "s07_typmul")
    private String typeMultif;

    @Column(name = "s07_reffor")
    private String refFormat;

    @Column(name = "s07_refimp")
    private String refImprime;

    @Column(name = "s07_refsup")
    private String refSupport;

    @Column(name = "s07_reftri")
    private String refTri;

    @Column(name = "s07_refech")
    private String refech;

    @Column(name = "s07_refecl")
    private String refecl;

    @Column(name = "n07_nbrrep")
    private Integer nbrRep = 1;

    @Column(name = "s07_ficatt")
    private String ficAtt;

    @Column(name = "s07_codadr")
    private String codeAdr;

    @Column(name = "s07_libfic")
    private String libFichier;

    @Column(name = "n07_maxpag")
    private Integer page;

    @Column(name = "s07_codprd")
    private String codeProd;

    @Column(name = "s07_codcli")
    private String codeClient;

    @Column(name = "b07_eclate")
    private Integer eclatement;

    @Column(name = "s07_typsig", columnDefinition = "fichie_typsig")
    @ColumnTransformer(write = "?::fichie_typsig")
    private String typeSig;

    @Column(name = "s07_coddoc")
    private String codeDocument;

    @Column(name = "n07_repexp")
    private Integer repExp = 1;

    @Column(name = "b07_specim", columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean specim = false;

    @Column(name = "b07_cbadre", columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean cbadre = false;

    @Column(name = "b07_ediver", columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean ediver = false;

    @Column(name = "b07_banimp", columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean banimp = true;

    @Column(name = "b07_appbac", columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean appbac = false;

    @Column(name = "s07_verloc")
    private String verLoc;
}
