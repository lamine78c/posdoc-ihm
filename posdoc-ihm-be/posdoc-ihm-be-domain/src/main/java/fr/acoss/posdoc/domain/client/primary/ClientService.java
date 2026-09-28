package fr.acoss.posdoc.domain.client.primary;

import fr.acoss.posdoc.domain.client.model.Client;
import fr.acoss.posdoc.domain.client.secondary.ClientPersistence;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.client.validators.ClientValidators.codeAlliageValidator;
import static fr.acoss.posdoc.domain.client.validators.ClientValidators.codeValidator;
import static fr.acoss.posdoc.domain.client.validators.ClientValidators.libelleValidator;

public class ClientService {

    private static final String CLIENT = "Client";
    private static final String FICHIER = "Fichier";

    private final ClientPersistence clientPersistence;
    private final FichierPersistence fichierPersistence;

    public ClientService(
            final ClientPersistence clientPersistence,
            final FichierPersistence fichierPersistence
    ) {
        this.clientPersistence = clientPersistence;
        this.fichierPersistence = fichierPersistence;
    }

    public Client createClient(final Client client) {
        codeValidator().validate(client.getCode());
        libelleValidator().validate(client.getLibelle());
        codeAlliageValidator().validate(client.getCodeAlliage());
        codeAlliageValidator().validate(client.getCodeAlliage());
        if (clientPersistence.exists(client.getCode())) {
            throw new AlreadyExistingElement(CLIENT, client.getCode());
        }
        return clientPersistence.create(client);
    }

    public Client updateClient(final Client client) {
        codeValidator().validate(client.getCode());
        libelleValidator().validate(client.getLibelle());
        codeAlliageValidator().validate(client.getCodeAlliage());
        if (!clientPersistence.exists(client.getCode())) {
            throw new ElementNotFoundException(CLIENT, client.getCode());
        }
        return clientPersistence.create(client);
    }

    public void deleteClient(final String codes) {
        clientPersistence.delete(codes);
    }

    public void deleteClients(List<String> clientCodes) {
        // vérification dépendance Fichier
        List<String> listFich = fichierPersistence.clientsExistsInFichiers(clientCodes);
        if (!listFich.isEmpty()) {
            throw new StileExistingElement(CLIENT, clientCodes, FICHIER);
        }
        clientPersistence.deleteAll(clientCodes);
    }

}
