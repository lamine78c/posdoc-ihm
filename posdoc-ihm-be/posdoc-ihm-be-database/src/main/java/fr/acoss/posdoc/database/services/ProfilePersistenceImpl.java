package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ProfileRepository;
import fr.acoss.posdoc.database.entities.ProfileEntity;
import fr.acoss.posdoc.database.mappers.ProfileMapper;
import fr.acoss.posdoc.domain.profile.model.Profile;
import fr.acoss.posdoc.domain.profile.secondary.ProfilePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProfilePersistenceImpl  extends AbstractObjectPersistence<ProfileEntity, String, Profile>
        implements ProfilePersistence {

    private static final ProfileMapper MAPPER = ProfileMapper.INSTANCE;

    private final ProfileRepository profileRepository;

    public ProfilePersistenceImpl(
            ProfileRepository profileRepository) {this.profileRepository = profileRepository;}

    @Override
    protected JpaSpecificationExecutor<ProfileEntity> getSpecificationExecutor() {
        return profileRepository;
    }

    @Override
    protected JpaRepository<ProfileEntity, String> getRepository() {
        return profileRepository;
    }

    @Override
    protected Function<ProfileEntity, Profile> entityToDomainFunction() {
        return MAPPER::entityToDomainWithHabilitation;
    }

    protected Function<ProfileEntity, Profile> entityToDomainWithoutHabilitationFunction() {
        return MAPPER::entityToDomainWithoutHabilitation;
    }

    protected Function<ProfileEntity, Profile> entityToDomainWithHabilitationFunction() {
        return MAPPER::entityToDomainWithHabilitation;
    }

    @Override
    protected Function<Profile, ProfileEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }


    @Override
    @Transactional
    public Profile getProfile(String id) {
        ProfileEntity p = profileRepository.findById(id).orElse(null);
        return entityToDomainWithHabilitationFunction().apply(p);
    }


    @Override
    @Transactional
    public List<Profile> selectAll() {
        return profileRepository.findAll().stream().map(e -> entityToDomainWithoutHabilitationFunction().apply(e))
                .collect(Collectors.toList());
    }

}