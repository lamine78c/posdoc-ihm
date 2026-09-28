package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import fr.acoss.posdoc.database.entities.converters.CoutPliConverter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "tarifs")
public class TarifEntity {

    @EmbeddedId
    @AttributeOverride(name = "c44_typtar", column = @Column(name = "c44_typtar", nullable = false))
    @AttributeOverride(name = "c44_numtar", column = @Column(name = "c44_numtar", nullable = false))
    private TarifCompositeId id;

    @Column(name = "d44_dtarid")
    private LocalDate dateDebut;

    @Column(name = "d44_dtarif")
    private LocalDate dateFin;

    @Column(name = "n44_coupli", nullable = false)
    @Convert(converter = CoutPliConverter.class)
    private Double coutPli;

    @Column(name = "b44_urgent", nullable = false)
    @Convert(converter = BooleanConverter.class)
    private Boolean urgent;

    @Column(name = "b44_optar1")
    @Convert(converter = BooleanConverter.class)
    private Boolean optar1 = false;

    @Column(name = "b44_optar2")
    @Convert(converter = BooleanConverter.class)
    private Boolean optar2 = false;

    @Column(name = "b44_optar3")
    @Convert(converter = BooleanConverter.class)
    private Boolean optar3 = false;
}
