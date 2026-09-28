package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.BooleanConverter;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@Filter(name = "organismeFilter", condition = "c11_codorg in (:organisme)")
@Entity
@Getter
@Setter
@Table(name = "exempl")
public class ExemplaireEntity {

    @EmbeddedId
    @AttributeOverride(name = "c11_codenv", column = @Column(name = "c11_codenv", nullable = false))
    @AttributeOverride(name = "c11_codorg", column = @Column(name = "c11_codorg", nullable = false))
    @AttributeOverride(name = "c11_codapp", column = @Column(name = "c11_codapp", nullable = false))
    @AttributeOverride(name = "c11_codcom", column = @Column(name = "c11_codcom", nullable = false))
    @AttributeOverride(name = "c11_codfic", column = @Column(name = "c11_codfic", nullable = false))
    @AttributeOverride(name = "c11_codgam", column = @Column(name = "c11_codgam", nullable = false))
    @AttributeOverride(name = "c11_numexe", column = @Column(name = "c11_numexe", nullable = false))
    private ExemplaireCompositeId id;


    @Column(name = "s11_codsit")
    private String codsit;

    @Column(name = "s11_codres")
    private String codres;

    @Column(name = "s11_coddes")
    private String coddes;

    @Column(name = "n11_nbrexe")
    private Integer nbrexe;

    @Column(name = "b11_exeact")
    @Convert(converter = BooleanConverter.class)
    private Boolean exeact;


}
