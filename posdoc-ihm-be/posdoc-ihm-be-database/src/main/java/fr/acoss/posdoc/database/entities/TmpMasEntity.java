package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tmpmas")
public class TmpMasEntity {

    @EmbeddedId
    private TmpMasCompositeId id;

    @Column(name = "s75_mascom", nullable = false)
    private String mascom;

    @Column(name = "s75_masfic", nullable = false)
    private String masfic;

    @Column(name = "s75_codsit", nullable = false)
    private String codsit;

    @Column(name = "s75_libfic", nullable = false)
    private String libfic;

    @Column(name = "s75_typsup", nullable = false)
    private String typsup;
}