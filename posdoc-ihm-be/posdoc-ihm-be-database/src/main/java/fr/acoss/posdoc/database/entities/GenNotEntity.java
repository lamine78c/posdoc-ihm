package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "gennot")
public class GenNotEntity implements Serializable {

    @EmbeddedId
    private GenNotCompositeId id;

    @Column(name = "n28_poinot", nullable = false, precision = 6, scale = 0)
    private BigDecimal poinot;
}