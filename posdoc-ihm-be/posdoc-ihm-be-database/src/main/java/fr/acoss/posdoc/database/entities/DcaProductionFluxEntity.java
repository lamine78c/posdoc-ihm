package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "dca_production_flux", schema = "cereus")
public class DcaProductionFluxEntity {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "nom_archive_retour")
    private String nomArchiveRetour;

    @Column(name = "date_production")
    private LocalDateTime dateProduction;

    @Column(name = "date_poste")
    private LocalDateTime datePoste;

    @Column(name = "nom_fichier_retour")
    private String nomFichierRetour;

    @Column(name = "nombre_plis_fabriques")
    private Integer nombrePlisFabriques;


    private Integer details;
}
