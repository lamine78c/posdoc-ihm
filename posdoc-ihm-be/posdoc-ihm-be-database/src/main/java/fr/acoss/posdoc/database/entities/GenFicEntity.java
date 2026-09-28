package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "genfic")
public class GenFicEntity {

    @EmbeddedId
    private GenFicCompositeId id;

    @Column(name = "s15_ficsta", nullable = false)
    private String ficsta = "";

    @Column(name = "s15_ficinf")
    private String ficinf;

    @Column(name = "b15_frefec", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean frefec = false;

    @Column(name = "d15_dfichc")
    private LocalDateTime dfichc;

    @Column(name = "d15_dfichd")
    private LocalDateTime dfichd;

    @Column(name = "d15_dficht")
    private LocalDateTime dficht;

    @Column(name = "d15_dfichs")
    private LocalDateTime dfichs;

    @Column(name = "d15_dfichh")
    private LocalDateTime dfichh;

    @Column(name = "b15_ficvid", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean ficvid = false;

    @Column(name = "s15_libfic", nullable = false)
    private String libfic = "";

    @Column(name = "s15_typfor", nullable = false)
    private String typfor = "";

    @Column(name = "s15_typsup", nullable = false)
    private String typsup = "";

    @Column(name = "s15_typmul", nullable = false)
    private String typmul = "";

    @Column(name = "s15_reffor")
    private String reffor;

    @Column(name = "s15_refimp")
    private String refimp;

    @Column(name = "s15_refsup")
    private String refsup;

    @Column(name = "s15_reftri")
    private String reftri;

    @Column(name = "s15_refech")
    private String refech;

    @Column(name = "s15_refecl")
    private String refecl;

    @Column(name = "n15_nbrrep", nullable = false)
    private Integer nbrrep = 1;

    @Column(name = "s15_ficatt")
    private String ficatt;

    @Column(name = "s15_verimp")
    private String verimp;

    @Column(name = "n15_maxpag", nullable = false)
    private Integer maxpag = 5;

    @Column(name = "b15_specim", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean specim = false;

    @Column(name = "b15_cbadre", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean cbadre = false;

    @Column(name = "b15_ediver", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean ediver = false;

    @Column(name = "b15_banimp", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean banimp = true;

    @Column(name = "b15_appbac", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean appbac = false;

    @Column(name = "d15_dfiexp")
    private LocalDateTime dfiexp;
    @Column(name = "s15_codprd")
    private String codprd;
    @Column(name = "d15_dappcr")
    private LocalDateTime dappcr;
    @Column(name = "n15_repexp", nullable = false)
    private Integer repexp = 1;

    @Column(name = "s15_masuti")
    private String masuti;
    @Column(name = "s15_codrnd")
    private String codrnd;

    @Column(name = "s15_typsig", nullable = false, columnDefinition = "genfic_typsig")
    @ColumnTransformer(write = "?::genfic_typsig")
    private String typsig = "";

    @Column(name = "n15_pagfic", nullable = false)
    private Integer pagfic = 0;
    @Column(name = "n15_plific", nullable = false)
    private Integer plific = 0;
    @Column(name = "n15_rejfic", nullable = false)
    private Integer rejfic = 0;

    @Column(name = "s15_codcli")
    private String codcli;
    @Column(name = "s15_typtar")
    private String typtar;
    @Column(name = "n15_codpal")
    private Integer codpal;
    @Column(name = "s15_codbon")
    private String codbon;
    @Column(name = "d15_drecep")
    private LocalDateTime drecep;

    @Column(name = "s15_inform")
    private String inform;

    @Column(name = "n15_delmsp")
    private Integer delmsp;
    @Column(name = "s15_codsit")
    private String codsit;

    @Column(name = "b15_eclate", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean eclate = false;

}
