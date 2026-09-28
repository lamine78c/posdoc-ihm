package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.NoticePornotEnumType;
import fr.acoss.posdoc.types.NoticePornotType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.math.BigDecimal;
import java.time.LocalDate;

@TypeDef(name = "pgsql_enum_pornot", typeClass = NoticePornotEnumType.class)
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "notice")
public class NoticeEntity {

    @Id
    @Column(name = "c26_codnot", nullable = false, length = 12)
    private String codnot;

    @Column(name = "s26_libnot", nullable = false, length = 50)
    private String libnot;

    @Column(name = "s26_fornot", nullable = false, length = 10)
    private String fornot;

    @Column(name = "n26_poinot", nullable = false, precision = 6)
    private BigDecimal poinot;

    @Type(type = "pgsql_enum_pornot")
    @Column(name = "s26_pornot", nullable = false, columnDefinition = "notice_pornot default 'L'")
    @Enumerated(EnumType.STRING)
    private NoticePornotType pornot;

    @Column(name = "d26_dnotir")
    private LocalDate dnotir;

    @Column(name = "b26_perime", nullable = false)
    private Short perime;

    @Column(name = "s26_codsit", length = 6)
    private String codsit;

    @Transient
    private Boolean isNotAuthorisedToBeDeleted;


}