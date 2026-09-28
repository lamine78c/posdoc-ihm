package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class HisMasCompositeId implements Serializable {

    @Column(name = "c33_masenv", nullable = false)
    private String masenv;

    @Column(name = "c33_masorg", nullable = false)
    private String masorg;

    @Column(name = "c33_masapp", nullable = false)
    private String masapp;

    @Column(name = "c33_masper", nullable = false)
    private String masper;

    @Column(name = "c33_mascom", nullable = false)
    private String mascom;

    @Column(name = "c33_masnum", nullable = false)
    private String masnum;

    @Column(name = "c33_masfic", nullable = false)
    private String masfic;

    @Column(name = "c33_codenv", nullable = false)
    private String codenv;

    @Column(name = "c33_codorg", nullable = false)
    private String codorg;

    @Column(name = "c33_codapp", nullable = false)
    private String codapp;

    @Column(name = "c33_percod", nullable = false)
    private String percod;

    @Column(name = "c33_codcom", nullable = false)
    private String codcom;

    @Column(name = "c33_numcom", nullable = false)
    private String numcom;

    @Column(name = "c33_codfic", nullable = false)
    private String codfic;
}
