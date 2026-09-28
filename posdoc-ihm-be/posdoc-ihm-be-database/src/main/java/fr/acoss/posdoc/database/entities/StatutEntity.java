package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "statut")
public class StatutEntity {

    @Id
    @Column(name = "c13_codsta", nullable = false)
    private String code;

    @Column(name = "s13_libsta", nullable = false)
    private String libelle;
}