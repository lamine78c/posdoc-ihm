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
public class GenNotCompositeId implements Serializable {
    @Column(name = "c28_codenv", nullable = false, length = 1)
    private String codenv;

    @Column(name = "c28_codorg", nullable = false, length = 3)
    private String codorg;

    @Column(name = "c28_codapp", nullable = false, length = 4)
    private String codapp;

    @Column(name = "c28_percod", nullable = false, length = 9)
    private String percod;

    @Column(name = "c28_codcom", nullable = false, length = 4)
    private String codcom;

    @Column(name = "c28_numcom", nullable = false, length = 2)
    private String numcom;

    @Column(name = "c28_codfic", nullable = false, length = 5)
    private String codfic;

    @Column(name = "c28_codnot", nullable = false, length = 12)
    private String codnot;
}
