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
public class StaInfCompositeId  implements Serializable {
    @Column(name = "c65_statut", nullable = false)
    private String statut;

    @Column(name = "c65_codinf", nullable = false)
    private String codinf;
}
