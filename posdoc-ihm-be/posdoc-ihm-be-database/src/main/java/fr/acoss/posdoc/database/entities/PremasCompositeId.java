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
public class PremasCompositeId implements Serializable {
    @Column(name = "c84_codenv", nullable = false)
    private String codenv;

    @Column(name = "c84_codorg", nullable = false)
    private String codorg;

    @Column(name = "c84_codapp", nullable = false)
    private String codapp;

    @Column(name = "c84_percod", nullable = false)
    private String percod;

    @Column(name = "c84_codcom", nullable = false)
    private String codcom;

    @Column(name = "c84_numcom", nullable = false)
    private String numcom;

    @Column(name = "c84_codfic", nullable = false)
    private String codfic;
}
