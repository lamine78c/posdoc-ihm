package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "notfic", schema = "public")
public class NotficEntity {
    @EmbeddedId
    private NotficCompositeId id;

    @Column(name = "d27_dnotid")
    @Temporal(TemporalType.DATE)
    private Date dnotid;

    @Column(name = "d27_dnotit")
    @Temporal(TemporalType.DATE)
    private Date dnotit;

    @Column(name = "n27_maxnot", nullable = false, precision = 4)
    private BigDecimal maxnot;

    @Column(name = "n27_curnot", nullable = false, precision = 4)
    private BigDecimal curnot;
}