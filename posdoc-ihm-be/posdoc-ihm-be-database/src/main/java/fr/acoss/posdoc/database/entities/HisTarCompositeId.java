package fr.acoss.posdoc.database.entities;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class HisTarCompositeId implements Serializable {

    @Column(name = "c46_codenv", nullable = false)
    private String codenv;
    
    @Column(name = "c46_codorg", nullable = false)
    private String codorg;
    
    @Column(name = "c46_codapp", nullable = false)
    private String codapp;
    
    @Column(name = "c46_percod", nullable = false)
    private String percod;
    
    @Column(name = "c46_codcom", nullable = false)
    private String codcom;
    
    @Column(name = "c46_numcom", nullable = false)
    private String numcom;
    
    @Column(name = "c46_codfic", nullable = false)
    private String codfic;
    
    @Column(name = "c46_typtar", nullable = false)
    private String typtar;
}
