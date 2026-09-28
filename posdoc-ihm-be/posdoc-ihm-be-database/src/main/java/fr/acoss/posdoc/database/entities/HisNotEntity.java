package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "hisnot")
public class HisNotEntity {
    @EmbeddedId
    private HisNotCompositeId id;

    @Column(name = "n29_poinot", nullable = false, precision = 6, scale = 0)
    private BigDecimal poinot;
}
