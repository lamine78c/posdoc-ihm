package fr.acoss.posdoc.database.entities;

import fr.acoss.posdoc.database.entities.converters.HelpStateTypeConverter;
import fr.acoss.posdoc.types.HelpStateType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "help")
public class HelpEntity {

    @Id
    @Column(name="id")
    @SequenceGenerator(name = "help_id_seq", sequenceName = "help_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "help_id_seq")
    private Integer id;

    @Column(name="path", nullable = false)
    private String path;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name ="message")
    private String message;

    @Column(name = "state", nullable = false)
    @ColumnTransformer(write = "?::help_typestate")
    @Convert(converter = HelpStateTypeConverter.class)
    private HelpStateType state;

    @Column(name="created_by", nullable = false)
    private String createdBy;

    @Column(name="updated_by", nullable = false)
    private String updatedBy;
}
