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
@Table(name = "gentar")
public class GenTarEntity {
    @EmbeddedId
    private GenTarCompositeId id;
    @Column(name = "n45_nbplis", nullable = false)
    private Integer n45Nbplis = 0;
    @Column(name = "n45_coutot", nullable = false)
    private Integer n45Coutot = 0;

}
