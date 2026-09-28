package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ProfileEntity;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfileRepository extends GenericRepository <ProfileEntity, String> {
    List<ProfileEntity> findAllByOrderByLibelleProfileAsc();
}
