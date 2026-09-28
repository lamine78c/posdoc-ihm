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
@Table(name = "hisfic")
public class HisFicEntity {

    @EmbeddedId
    private HisFicCompositeId id;

    @Column(name = "s22_ficsta", nullable = false)
    private String ficsta = "";

    @Column(name = "s22_ficinf")
    private String ficinf;

    @Column(name = "b22_frefec", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean frefec = false;

    @Column(name = "d22_dfichc")
    private LocalDateTime dfichc;

    @Column(name = "d22_dfichd")
    private LocalDateTime dfichd;

    @Column(name = "d22_dficht")
    private LocalDateTime dficht;

    @Column(name = "d22_dfichs")
    private LocalDateTime dfichs;

    @Column(name = "d22_dfichh")
    private LocalDateTime dfichh;

    @Column(name = "b22_ficvid", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean ficvid = false;

    @Column(name = "s22_libfic", nullable = false)
    private String libfic = "";

    @Column(name = "s22_typfor", nullable = false)
    private String typfor = "";

    @Column(name = "s22_typsup", nullable = false)
    private String typsup = "";

    @Column(name = "s22_typmul", nullable = false)
    private String typmul = "";

    @Column(name = "s22_reffor")
    private String reffor;

    @Column(name = "s22_refimp")
    private String refimp;

    @Column(name = "s22_refsup")
    private String refsup;

    @Column(name = "s22_reftri")
    private String reftri;

    @Column(name = "s22_refech")
    private String refech;

    @Column(name = "s22_refecl")
    private String refecl;

    @Column(name = "n22_nbrrep", nullable = false)
    private Integer nbrrep = 1;

    @Column(name = "s22_ficatt")
    private String ficatt;

    @Column(name = "s22_verimp")
    private String verimp;

    @Column(name = "n22_maxpag", nullable = false)
    private Integer maxpag = 5;

    @Column(name = "b22_specim", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean specim = false;

    @Column(name = "b22_cbadre", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean cbadre = false;

    @Column(name = "b22_ediver", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean ediver = false;

    @Column(name = "b22_banimp", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean banimp = true;

    @Column(name = "b22_appbac", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean appbac = false;

    @Column(name = "d22_dfiexp")
    private LocalDateTime dfiexp;

    @Column(name = "s22_codprd")
    private String codprd;

    @Column(name = "d22_dappcr")
    private LocalDateTime dappcr;

    @Column(name = "n22_repexp", nullable = false)
    private Integer repexp = 1;

    @Column(name = "s22_masuti")
    private String masuti;

    @Column(name = "s22_codrnd")
    private String codrnd;

    @Column(name = "s22_typsig", nullable = false, columnDefinition = "hisfic_typsig")
    @ColumnTransformer(write = "?::hisfic_typsig")
    private String typsig = "";

    @Column(name = "n22_pagfic", nullable = false)
    private Integer pagfic = 0;

    @Column(name = "n22_plific", nullable = false)
    private Integer plific = 0;

    @Column(name = "n22_rejfic", nullable = false)
    private Integer rejfic = 0;

    @Column(name = "s22_codcli")
    private String codcli;

    @Column(name = "s22_typtar")
    private String typtar;

    @Column(name = "n22_codpal")
    private Integer codpal;

    @Column(name = "s22_codbon")
    private String codbon;

    @Column(name = "d22_drecep")
    private LocalDateTime drecep;

    @Column(name = "s22_inform")
    private String inform;

    @Column(name = "n22_delmsp")
    private Integer delmsp;

    @Column(name = "s22_codsit")
    private String codsit;

    @Column(name = "b22_eclate", nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanConverter.class)
    private boolean eclate = false;

}
