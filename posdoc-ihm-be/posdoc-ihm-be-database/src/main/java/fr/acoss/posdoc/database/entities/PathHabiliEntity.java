package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "path_habili")
public class PathHabiliEntity {

    @Id
    @Column(name="path", nullable = false)
    private String path;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habili_id", nullable = false, updatable = false)
    private HabilitationEntity habilitationEntity;
}
