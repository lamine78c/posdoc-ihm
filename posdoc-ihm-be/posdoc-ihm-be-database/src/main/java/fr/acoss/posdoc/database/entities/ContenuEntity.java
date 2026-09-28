package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "contenu")
public class ContenuEntity {

    @Id
    @Column(name="id")
    @SequenceGenerator(name = "contenu_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "contenu_id_seq")
    private Integer id;

    @Column(name="titre")
    private String titre;

    @Column(name = "activation", nullable = false)
    private LocalDateTime dateActivation;

    @Column(name = "expiration", nullable = false)
    private LocalDateTime dateExpiration;

    @Column(name ="message")
    private String message;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "contenus_regions",
            joinColumns = @JoinColumn(
                    name = "contenu_id", referencedColumnName = "id"
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "region_code", referencedColumnName = "c62_codreg"
            )
    )
    private Set<RegionEntity> regions;
}
