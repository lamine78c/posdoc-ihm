package fr.acoss.posdoc.database.entities;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "profile")
public class ProfileEntity {

    @Id
    @Column(name = "code", nullable = false)
    private String profile;

    @Column(name = "libelle", nullable = false)
    private String libelleProfile;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "profile_habili",
            joinColumns = @JoinColumn(
                    name = "profile_code", referencedColumnName = "code"
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "habili_id", referencedColumnName = "id"
            )
    )
    private Set<HabilitationEntity> habilitations;

    public String getProfile() {
        return profile;
    }

    public void setProfile(String profile) {
        this.profile = profile;
    }

    public String getLibelleProfile() {
        return libelleProfile;
    }

    public void setLibelleProfile(String libelleProfile) {
        this.libelleProfile = libelleProfile;
    }
}
