package fr.acoss.posdoc.domain.profile.primary;

import fr.acoss.posdoc.domain.profile.model.Profile;
import fr.acoss.posdoc.domain.profile.secondary.ProfilePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import static fr.acoss.posdoc.domain.profile.validators.ProfileValidators.libelleProfileValidator;
import static fr.acoss.posdoc.domain.profile.validators.ProfileValidators.profileValidator;

public class ProfileService {

    private final ProfilePersistence profilePersistence;

    public ProfileService(final ProfilePersistence profilePersistence) {
        this.profilePersistence = profilePersistence;
    }

    public Profile createProfile(final Profile profile) {

        profileValidator().validate(profile.getProfile());
        libelleProfileValidator().validate(profile.getLibelleProfile());

        if (profilePersistence.exists(profile.getProfile())) {
            throw new AlreadyExistingElement("profile", profile.getProfile());
        }

        return profilePersistence.create(profile);
    }

    public Profile updateProfile(final Profile profile) {

        profileValidator().validate(profile.getProfile());
        libelleProfileValidator().validate(profile.getLibelleProfile());

        if (!profilePersistence.exists(profile.getProfile())) {
            throw new ElementNotFoundException("Profile", profile.getProfile());
        }

        return profilePersistence.create(profile);
    }

    public void deleteProfile(final String code) {
        profilePersistence.delete(code);
    }

}
