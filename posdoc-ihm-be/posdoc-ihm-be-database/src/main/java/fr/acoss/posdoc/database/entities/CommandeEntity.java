package fr.acoss.posdoc.database.entities;

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

@Filter(name = "organismeFilter", condition = "c05_codorg in (:organisme)")
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "comman")
public class CommandeEntity {

    public CommandeEntity(CommandeCompositeId id, String libelle, String codreg, Boolean isNotAuthorisedToBeDeleted) {
        this.id = id;
        this.libelle = libelle;
        this.codreg = codreg == null ? "" : codreg;
        this.isNotAuthorisedToBeDeleted = isNotAuthorisedToBeDeleted;
    }

    public CommandeEntity(CommandeCompositeId id, String libelle) {
        this.id = id;
        this.libelle = libelle;
    }

    @EmbeddedId
    @AttributeOverride(name = "c05_codenv", column = @Column(name = "c05_codenv", nullable = false))
    @AttributeOverride(name = "c05_codorg", column = @Column(name = "c05_codorg", nullable = false))
    @AttributeOverride(name = "c05_codapp", column = @Column(name = "c05_codapp", nullable = false))
    @AttributeOverride(name = "c05_codcom", column = @Column(name = "c05_codcom", nullable = false))
    private CommandeCompositeId id;

    @Column(name = "s05_libcom")
    private String libelle;

    @Transient
    private String codreg;

    @Transient
    private Boolean isNotAuthorisedToBeDeleted;

}
