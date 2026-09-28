package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "region_mapping")
public class RegionMappingEntity implements Serializable {

    @Column(name = "codreg", nullable = false)
    private String codeRegion;

    @Id
    @Column(name = "codana", nullable = false)
    private String codeAnais;
}
