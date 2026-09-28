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
public class NotficCompositeId implements Serializable {

    @Column(name = "c27_codenv", nullable = false, length = 1)
    private String codenv;

    @Column(name = "c27_codorg", nullable = false, length = 3)
    private String codorg;

    @Column(name = "c27_codapp", nullable = false, length = 4)
    private String codapp;

    @Column(name = "c27_codcom", nullable = false, length = 4)
    private String codcom;

    @Column(name = "c27_codfic", nullable = false, length = 5)
    private String codfic;

    @Column(name = "c27_codnot", nullable = false, length = 12)
    private String codnot;
}