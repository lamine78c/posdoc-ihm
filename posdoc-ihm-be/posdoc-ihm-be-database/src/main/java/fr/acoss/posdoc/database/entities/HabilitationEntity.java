package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.HabilitationTypeConverter;
import fr.acoss.posdoc.types.HabilitationType;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@Table(name = "habili")
public class HabilitationEntity {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "parent_id")
    private Integer parentId;

    @Column(name = "s97_typeit")
    @Convert(converter = HabilitationTypeConverter.class)
    private HabilitationType habilitationType;

    @Column(name = "text")
    private String identite;

    @Column(name = "ordre")
    private Integer ordre;

}
