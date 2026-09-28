package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "papaad")
public class PapaadEntity {

    @EmbeddedId
    @AttributeOverride(name = "c79_codcom", column = @Column(name = "c79_codcom", nullable = false))
    @AttributeOverride(name = "c79_codfic", column = @Column(name = "c79_codfic", nullable = false))
    @AttributeOverride(name = "c79_cnotif", column = @Column(name = "c79_cnotif", nullable = false))
    private PapaadCompositeIdEntity id;


    @Column(name = "s79_libpaa")
    private String libelle;

    @Column(name = "b79_period")
    @Convert(converter = BooleanConverter.class)
    private Boolean periode;

    @Column(name = "s79_codrnd")
    private String codeRND;

    @Column(name = "s79_apppro")
    private String appPro;

    @Column(name = "s79_typhas")
    private String typeHas;

    @Column(name = "s79_format")
    private String format;

    @Column(name = "s79_isurib")
    private String isUrib;

    @Column(name = "b79_nstruc")
    @Convert(converter = BooleanConverter.class)
    private Boolean nsTruc;

    @Column(name = "b79_imprim")
    @Convert(converter = BooleanConverter.class)
    private Boolean imprime;

    @Column(name = "b79_huissi")
    @Convert(converter = BooleanConverter.class)
    private Boolean huissier;

    @Column(name = "b79_numnot")
    @Convert(converter = BooleanConverter.class)
    private Boolean numNot;

    @Column(name = "b79_strraf")
    @Convert(converter = BooleanConverter.class)
    private Boolean strRaf;

    @Column(name = "b79_contra")
    @Convert(converter = BooleanConverter.class)
    private Boolean contrat;

    @Column(name = "b79_medele")
    @Convert(converter = BooleanConverter.class)
    private Boolean medele;

    @Column(name = "b79_idtbcc")
    @Convert(converter = BooleanConverter.class)
    private Boolean idtbcc;
}
