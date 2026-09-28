package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ProfileEntity;
import fr.acoss.posdoc.domain.profile.model.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ProfileMapper {

    ProfileMapper INSTANCE = Mappers.getMapper(ProfileMapper.class);

    @Mapping(target = "habilitations", ignore = true)
    Profile entityToDomainWithoutHabilitation(final ProfileEntity profileEntity);

    Profile entityToDomainWithHabilitation(final ProfileEntity profileEntity);

    ProfileEntity domainToEntity(final Profile profile);
}
