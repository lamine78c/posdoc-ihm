package fr.acoss.posdoc.service.anais;

import fr.acoss.posdoc.domain.utilisateur.model.AnaisUser;
import fr.acoss.posdoc.domain.utilisateur.secondary.AnaisUserProviderPersistence;
import fr.acoss.posdoc.service.anais.dto.AnaisUserDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implémentation du provider pour récupérer les informations utilisateur depuis Anais
 */
@Slf4j
@Service
public class AnaisUserProviderPersistenceImpl implements AnaisUserProviderPersistence {

    private final AnaisClient anaisClient;

    public AnaisUserProviderPersistenceImpl(AnaisClient anaisClient) {
        this.anaisClient = anaisClient;
    }

    @Override
    public Optional<AnaisUser> getUserInfo(String uid) {
        if (uid == null || uid.trim().isEmpty()) {
            return Optional.empty();
        }

        try {
            AnaisUserDTO dto = anaisClient.getUserByUid(uid);
            if (dto == null) {
                return Optional.empty();
            }

            AnaisUser user = mapDtoToModel(dto);
            return Optional.of(user);

        } catch (Exception e) {
            log.error("Erreur récupération infos Anais pour uid: {}", uid, e);
            return Optional.empty();
        }
    }

    @Override
    public String getUserFullName(String uid) {
        return getUserInfo(uid)
                .map(AnaisUser::getFullNameUid)
                .orElse(uid);
    }

    @Override
    public Map<String, String> getUsersFullNames(List<String> uids) {
        if (uids == null || uids.isEmpty()) {
            return new HashMap<>();
        }

        List<String> uniqueUids = uids.stream()
                .filter(uid -> uid != null && !uid.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());

        if (uniqueUids.isEmpty()) {
            return new HashMap<>();
        }

        try {
            Map<String, AnaisUserDTO> usersDto = anaisClient.getUsersByUids(uniqueUids);

            Map<String, String> result = new HashMap<>();
            for (String uid : uniqueUids) {
                AnaisUserDTO dto = usersDto.get(uid);
                if (dto != null) {
                    AnaisUser user = mapDtoToModel(dto);
                    result.put(uid, user.getFullNameUid());
                } else {
                    result.put(uid, uid);
                }
            }

            return result;

        } catch (Exception e) {
            log.error("Erreur récupération infos Anais pour {} utilisateurs", uniqueUids.size(), e);
            return uniqueUids.stream().collect(Collectors.toMap(uid -> uid, uid -> uid));
        }
    }

    private AnaisUser mapDtoToModel(AnaisUserDTO dto) {
        return AnaisUser.builder()
                .uid(dto.getUid())
                .nom(dto.getSn() != null ? dto.getSn() : "")
                .prenom(dto.getGivenName() != null ? dto.getGivenName() : "")
                .mail(dto.getMail() != null ? dto.getMail() : "")
                .telephone(dto.getTelephoneNumber() != null ? dto.getTelephoneNumber() : "")
                .etablissement(dto.getPersEtabLib() != null ? dto.getPersEtabLib() : "")
                .build();
    }
}
