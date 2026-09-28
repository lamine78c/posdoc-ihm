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
public class GenMasCompositeId implements Serializable {

    @Column(name = "c31_masenv", nullable = false)
    private String masenv;

    @Column(name = "c31_masorg", nullable = false)
    private String masorg;

    @Column(name = "c31_masapp", nullable = false)
    private String masapp;

    @Column(name = "c31_masper", nullable = false)
    private String masper;

    @Column(name = "c31_mascom", nullable = false)
    private String mascom;

    @Column(name = "c31_masnum", nullable = false)
    private String masnum;

    @Column(name = "c31_masfic", nullable = false)
    private String masfic;

    @Column(name = "c31_codenv", nullable = false)
    private String codenv;

    @Column(name = "c31_codorg", nullable = false)
    private String codorg;

    @Column(name = "c31_codapp", nullable = false)
    private String codapp;

    @Column(name = "c31_percod", nullable = false)
    private String percod;

    @Column(name = "c31_codcom", nullable = false)
    private String codcom;

    @Column(name = "c31_numcom", nullable = false)
    private String numcom;

    @Column(name = "c31_codfic", nullable = false)
    private String codfic;

}
