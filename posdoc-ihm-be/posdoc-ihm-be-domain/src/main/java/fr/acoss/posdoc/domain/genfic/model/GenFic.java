package fr.acoss.posdoc.domain.genfic.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GenFic {
    private String codenv;
    private String codorg;
    private String codapp;
    private String percod;
    private String codcom;
    private String codfic;
    private String numcom;
    private String ficsta;
    private boolean frefec;
    private boolean ficvid;
    private String libfic;
    private String typfor;
    private String typsup;
    private String typmul;
    private Integer nbrrep;
    private Integer maxpag;
    private boolean specim;
    private boolean cbadre;
    private boolean ediver;
    private boolean banimp;
    private boolean appbac;
    private Integer repexp;
    private String typsig;
    private Integer pagfic;
    private Integer plific;
    private Integer rejfic;
    private boolean eclate;
    private String ficinf;
    private LocalDateTime dfichc;
    private LocalDateTime dfichd;
    private LocalDateTime dficht;
    private LocalDateTime dfichs;
    private LocalDateTime dfichh;
    private String reffor;
    private String refimp;
    private String refsup;
    private String reftri;
    private String refech;
    private String refecl;
    private String ficatt;
    private String verimp;
    private LocalDateTime dfiexp;
    private String codprd;
    private LocalDateTime dappcr;
    private String masuti;
    private String codrnd;
    private String codcli;
    private String typtar;
    private Integer codpal;
    private String codbon;
    private LocalDateTime drecep;
    private String inform;
    private Integer delmsp;
    private String codsit;
}
