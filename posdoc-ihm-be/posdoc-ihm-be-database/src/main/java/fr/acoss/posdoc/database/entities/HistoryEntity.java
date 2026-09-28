package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.MyslogEnumAction;
import fr.acoss.posdoc.types.MyslogAction;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "myslog")
@TypeDef(name = "pgsql_enum_myslog", typeClass = MyslogEnumAction.class)
public class HistoryEntity {

    @Id
    @SequenceGenerator(name = "myslog_c37_codlog_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "myslog_c37_codlog_seq")
    @Column(name = "c37_codlog", nullable = false)
    private Integer id;

    @Column(name = "s37_codsta")
    private String station;

    @Column(name = "s37_codusr")
    private String utilisateur;

    @Column(name = "d37_create")
    private LocalDateTime insertionDate;

    @Type(type = "pgsql_enum_myslog")
    @Enumerated(EnumType.STRING)
    @Column(name = "s37_action")
    private MyslogAction actionUtilisateur;

    @Column(name = "s37_entite")
    private String entite;

    @Column(name = "s37_mywher")
    private String condition;

    @Column(name = "s37_setpre")
    private String entree;

    @Column(name = "s37_setsuc")
    private String sortie;

    @Column(name = "s37_codulo")
    private Integer codulo;

    @Column(name = "s37_versio")
    private String versio;

}
