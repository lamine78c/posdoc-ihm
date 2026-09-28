package fr.acoss.posdoc.service.anais;

import fr.acoss.posdoc.service.anais.dto.AnaisUserDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.xml.soap.MessageFactory;
import javax.xml.soap.SOAPBody;
import javax.xml.soap.SOAPConnection;
import javax.xml.soap.SOAPConnectionFactory;
import javax.xml.soap.SOAPElement;
import javax.xml.soap.SOAPEnvelope;
import javax.xml.soap.SOAPHeader;
import javax.xml.soap.SOAPMessage;
import javax.xml.soap.SOAPPart;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Client SOAP pour communiquer avec le web service Anais
 */
@Slf4j
@Component
public class AnaisClient {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String WSSE_PWD_ELEMENT = "Password";

    @Value("${anais.wsdl-url}")
    private String wsdlUrl;

    @Value("${anais.namespace}")
    private String namespace;

    @Value("${anais.username}")
    private String username;

    @Value("${anais.password}")
    private String pwd;

    /**
     * Récupère un utilisateur depuis Anais par son UID
     *
     * @param uid Identifiant de l'utilisateur
     * @return AnaisUserDTO ou null si non trouvé
     */
    public AnaisUserDTO getUserByUid(String uid) {
        try {
            // Création du message SOAP
            MessageFactory messageFactory = MessageFactory.newInstance();
            SOAPMessage soapMessage = messageFactory.createMessage();
            SOAPPart soapPart = soapMessage.getSOAPPart();

            // Construction du message SOAP
            SOAPEnvelope envelope = soapPart.getEnvelope();
            envelope.addNamespaceDeclaration("web", namespace);

            // Ajout du header WS-Security
            addWsSecurityHeader(soapMessage);

            // Construction du body
            SOAPBody soapBody = envelope.getBody();
            SOAPElement getListOfUser = soapBody.addChildElement("getListOfUserByAnaisArUserSearchAndAnaisArUserFilter", "web");
            SOAPElement anaisUserSearch = getListOfUser.addChildElement("anaisUserSearch");
            SOAPElement uidElement = anaisUserSearch.addChildElement("uid");
            uidElement.addTextNode(uid);

            soapMessage.saveChanges();

            // Appel du web service
            SOAPConnectionFactory soapConnectionFactory = SOAPConnectionFactory.newInstance();
            SOAPConnection soapConnection = soapConnectionFactory.createConnection();
            SOAPMessage soapResponse = soapConnection.call(soapMessage, wsdlUrl);
            soapConnection.close();

            return parseAnaisUserResponse(soapResponse);

        } catch (Exception e) {
            log.error("Erreur lors de l'appel Anais pour l'uid: {}", uid, e);
            return null;
        }
    }

    /**
     * Récupère plusieurs utilisateurs depuis Anais par leurs UIDs en un seul appel batch
     *
     * @param uids Liste des identifiants utilisateur (déjà dédupliqués)
     * @return Map avec uid en clé et AnaisUserDTO en valeur
     */
    public Map<String, AnaisUserDTO> getUsersByUids(List<String> uids) {
        if (uids == null || uids.isEmpty()) {
            return new HashMap<>();
        }

        try {
            MessageFactory messageFactory = MessageFactory.newInstance();
            SOAPMessage soapMessage = messageFactory.createMessage();
            SOAPPart soapPart = soapMessage.getSOAPPart();

            SOAPEnvelope envelope = soapPart.getEnvelope();
            envelope.addNamespaceDeclaration("web", namespace);

            addWsSecurityHeader(soapMessage);

            SOAPBody soapBody = envelope.getBody();
            SOAPElement getListOfUser = soapBody.addChildElement("getListOfUserByAnaisArUserSearchAndAnaisArUserFilter", "web");

            // Ajout d'un élément anaisUserSearch pour chaque UID
            for (String uid : uids) {
                if (uid != null && !uid.trim().isEmpty()) {
                    SOAPElement anaisUserSearch = getListOfUser.addChildElement("anaisUserSearch");
                    SOAPElement uidElement = anaisUserSearch.addChildElement("uid");
                    uidElement.addTextNode(uid);
                }
            }

            soapMessage.saveChanges();

            SOAPConnectionFactory soapConnectionFactory = SOAPConnectionFactory.newInstance();
            SOAPConnection soapConnection = soapConnectionFactory.createConnection();
            SOAPMessage soapResponse = soapConnection.call(soapMessage, wsdlUrl);
            soapConnection.close();

            List<AnaisUserDTO> users = parseAnaisUsersResponse(soapResponse);

            Map<String, AnaisUserDTO> userMap = new HashMap<>();
            for (AnaisUserDTO user : users) {
                if (user != null && user.getUid() != null) {
                    userMap.put(user.getUid(), user);
                }
            }

            log.info("Anais: {} utilisateurs récupérés sur {} demandés", userMap.size(), uids.size());
            return userMap;

        } catch (Exception e) {
            log.error("Erreur appel batch Anais pour {} uids", uids.size(), e);
            return new HashMap<>();
        }
    }

    /**
     * Ajoute le header WS-Security au message SOAP
     */
    private void addWsSecurityHeader(SOAPMessage soapMessage) throws AnaisClientException {
        try {
            SOAPHeader soapHeader = soapMessage.getSOAPHeader();
            if (soapHeader == null) {
                soapHeader = soapMessage.getSOAPPart().getEnvelope().addHeader();
            }

            String wsseNamespace = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd";
            String wsuNamespace = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd";

            SOAPElement security = soapHeader.addChildElement("Security", "wsse", wsseNamespace);
            security.addNamespaceDeclaration("wsu", wsuNamespace);

            SOAPElement usernameToken = security.addChildElement("UsernameToken", "wsse");
            SOAPElement usernameElement = usernameToken.addChildElement("Username", "wsse");
            usernameElement.addTextNode(username);

            SOAPElement pwdElement = usernameToken.addChildElement(WSSE_PWD_ELEMENT, "wsse"); //NOSONAR
            pwdElement.setAttribute("Type", "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest");
            pwdElement.addTextNode(pwd);

            byte[] nonceBytes = new byte[16];
            SECURE_RANDOM.nextBytes(nonceBytes);
            String nonce = Base64.getEncoder().encodeToString(nonceBytes);
            SOAPElement nonceElement = usernameToken.addChildElement("Nonce", "wsse");
            nonceElement.setAttribute("EncodingType", "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary");
            nonceElement.addTextNode(nonce);

            String created = Instant.now().toString();
            SOAPElement createdElement = usernameToken.addChildElement("Created", "wsu");
            createdElement.addTextNode(created);
        } catch (Exception e) {
            throw new AnaisClientException("Erreur lors de l'ajout du header WS-Security", e);
        }
    }

    private AnaisUserDTO parseAnaisUserResponse(SOAPMessage soapResponse) throws AnaisClientException {
        try {
            SOAPBody soapBody = soapResponse.getSOAPBody();
            Iterator<?> iterator = soapBody.getChildElements();
            while (iterator.hasNext()) {
                Object node = iterator.next();
                if (node instanceof SOAPElement) {
                    SOAPElement element = (SOAPElement) node;
                    if ("getListOfUserByAnaisArUserSearchAndAnaisArUserFilterResponse".equals(element.getLocalName())) {
                        return extractUserFromResponse(element);
                    }
                }
            }
            return null;
        } catch (Exception e) {
            throw new AnaisClientException("Erreur lors du parsing de la réponse Anais", e);
        }
    }

    private List<AnaisUserDTO> parseAnaisUsersResponse(SOAPMessage soapResponse) throws AnaisClientException {
        try {
            SOAPBody soapBody = soapResponse.getSOAPBody();
            Iterator<?> iterator = soapBody.getChildElements();
            while (iterator.hasNext()) {
                Object node = iterator.next();
                if (node instanceof SOAPElement) {
                    SOAPElement element = (SOAPElement) node;
                    if ("getListOfUserByAnaisArUserSearchAndAnaisArUserFilterResponse".equals(element.getLocalName())) {
                        return extractUsersFromResponse(element);
                    }
                }
            }
            return new ArrayList<>();
        } catch (Exception e) {
            throw new AnaisClientException("Erreur lors du parsing de la réponse Anais batch", e);
        }
    }

    private AnaisUserDTO extractUserFromResponse(SOAPElement responseElement) {
        Iterator<?> children = responseElement.getChildElements();
        while (children.hasNext()) {
            Object child = children.next();
            if (child instanceof SOAPElement) {
                SOAPElement element = (SOAPElement) child;
                if ("anaisArUserDTO".equals(element.getLocalName())) {
                    AnaisUserDTO user = new AnaisUserDTO();
                    populateUserFromElement(user, element);
                    return user;
                }
            }
        }
        return null;
    }

    private List<AnaisUserDTO> extractUsersFromResponse(SOAPElement responseElement) {
        List<AnaisUserDTO> users = new ArrayList<>();
        Iterator<?> children = responseElement.getChildElements();
        while (children.hasNext()) {
            Object child = children.next();
            if (child instanceof SOAPElement) {
                SOAPElement element = (SOAPElement) child;
                if ("anaisArUserDTO".equals(element.getLocalName())) {
                    AnaisUserDTO user = new AnaisUserDTO();
                    populateUserFromElement(user, element);
                    users.add(user);
                }
            }
        }
        return users;
    }

    private void populateUserFromElement(AnaisUserDTO user, SOAPElement userElement) {
        Iterator<?> fields = userElement.getChildElements();
        while (fields.hasNext()) {
            Object field = fields.next();
            if (field instanceof SOAPElement) {
                SOAPElement element = (SOAPElement) field;
                String fieldName = element.getLocalName();
                String fieldValue = element.getTextContent();

                switch (fieldName) {
                    case "uid":
                        user.setUid(fieldValue);
                        break;
                    case "sn":
                        user.setSn(fieldValue);
                        break;
                    case "givenName":
                        user.setGivenName(fieldValue);
                        break;
                    case "mail":
                        user.setMail(fieldValue);
                        break;
                    case "telephoneNumber":
                        user.setTelephoneNumber(fieldValue);
                        break;
                    case "dateEntreeRh":
                        user.setDateEntreeRh(fieldValue);
                        break;
                    case "dateSortieRh":
                        user.setDateSortieRh(fieldValue);
                        break;
                    case "persEtabLib":
                        user.setPersEtabLib(fieldValue);
                        break;
                    default:
                        // Champ non mappé, ignoré
                        break;
                }
            }
        }
    }
}
