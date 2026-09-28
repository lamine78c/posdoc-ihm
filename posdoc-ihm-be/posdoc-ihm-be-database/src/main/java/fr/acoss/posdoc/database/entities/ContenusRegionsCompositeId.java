package fr.acoss.posdoc.database.entities;

import lombok.*;

import javax.persistence.Column;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class ContenusRegionsCompositeId implements Serializable {

    @Column(name = "contenu_id")
    private Integer contenuId;

    @Column(name = "region_code")
    private String codeRegion;
}
