package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Table(name = "premas")
public class PremasEntity implements Serializable {
    @EmbeddedId
    private PremasCompositeId id;

    @Column(name = "s84_mascom", nullable = false)
    private String mascom;

    @Column(name = "s84_masfic", nullable = false)
    private String masfic;

    @Column(name = "s84_codsit", nullable = false)
    private String codsit;

    @Column(name = "s84_presta", nullable = false)
    private String presta;

    @Column(name = "d84_dprevc")
    private LocalDateTime dprevc;

    @Column(name = "d84_dprevt")
    private LocalDateTime dprevt;

    @Column(name = "d84_dprevi")
    private LocalDateTime dprevi;
}