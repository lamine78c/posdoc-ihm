package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "histar")
public class HisTarEntity {

    @EmbeddedId
    private HisTarCompositeId id;

    @Column(name = "n46_nbplis", nullable = false)
    private Integer nbplis = 0;

    @Column(name = "n46_coutot", nullable = false)
    private Integer coutot = 0;

}
