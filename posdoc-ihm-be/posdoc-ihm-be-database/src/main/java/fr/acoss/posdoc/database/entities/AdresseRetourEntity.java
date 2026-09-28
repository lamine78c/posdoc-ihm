package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

@Filter(name = "organismeFilter", condition = "c30_codorg in (:organisme)")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ficadr")
public class AdresseRetourEntity {

    @EmbeddedId
    @AttributeOverride(name = "c30_codadr", column = @Column(name = "c30_codadr", nullable = false))
    @AttributeOverride(name = "c30_codorg", column = @Column(name = "c30_codorg", nullable = false))
    private AdresseRetourCompositeId id;

    @Column(name = "s30_adres1")
    private String adresse1;

    @Column(name = "s30_adres2")
    private String adresse2;

    @Column(name = "s30_adres3")
    private String adresse3;

    @Column(name = "s30_adres4")
    private String adresse4;

    @Transient
    private Boolean isNotAuthorisedToBeDeleted;

}
