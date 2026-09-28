package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "service")
public class ServicePosdocEntity {

    @Id
    @SequenceGenerator(name = "service_id_seq", sequenceName = "service_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "service_id_seq")
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "libelle", nullable = false, unique = true)
    private String libelle;

    @Column(name="url", nullable = false)
    private String url;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name="created_by", nullable = false)
    private String createdBy;

    @Column(name="updated_by", nullable = false)
    private String updatedBy;
}
