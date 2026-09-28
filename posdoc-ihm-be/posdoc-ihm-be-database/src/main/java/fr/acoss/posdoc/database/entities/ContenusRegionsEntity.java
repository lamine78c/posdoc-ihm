package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "contenus_regions")
public class ContenusRegionsEntity {

    @EmbeddedId
    @AttributeOverride(name = "contenu_id", column = @Column(name = "contenu_id"))
    @AttributeOverride(name = "region_code", column = @Column(name = "region_code"))
    private ContenusRegionsCompositeId id;
}
