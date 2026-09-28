package fr.acoss.posdoc.domain.profile.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.profile.model.Profile;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface ProfilePersistence {

    Paginated<Profile> select(QueryParameters queryParameters);

    List<Profile> selectAll();

    Profile getProfile(String id);

    Profile create(Profile profile);

    Profile update(Profile profile);

    void delete(final String profile);

    boolean exists(final String profile);
}
