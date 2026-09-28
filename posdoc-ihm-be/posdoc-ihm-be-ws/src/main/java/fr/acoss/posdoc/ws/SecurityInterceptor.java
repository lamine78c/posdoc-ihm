package fr.acoss.posdoc.ws;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.types.Constantes;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Component
public class SecurityInterceptor implements Filter {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        if (req instanceof HttpServletRequest && res instanceof HttpServletResponse) {
            final var request = (HttpServletRequest) req;
            final var response = (HttpServletResponse) res;
            //Intercepter uniquement les requête (interceptor éxecuté 2 fois si il y a une erreur)
            // Ne pas intercepter les requêtes OPTIONS
            if (request.getDispatcherType() == DispatcherType.REQUEST && !request.getMethod().equalsIgnoreCase("OPTIONS")) {
                String userOrganismesHeader = request.getHeader("user.organismes");
                if (userOrganismesHeader != null && !userOrganismesHeader.isEmpty()) {
                    Session session = entityManager.unwrap(Session.class);
                    enableOrgnanismeFilter(userOrganismesHeader, session);
                    enableOrganismeRessourceFilter(userOrganismesHeader, session);
                }
            }
            addContext(request);
            try {
                chain.doFilter(request, response);
            } finally {
                if (TransactionSynchronizationManager.isSynchronizationActive()) {
                    TransactionSynchronizationManager.registerSynchronization(
                            new TransactionSynchronization() {
                                @Override public void afterCompletion(int status) {
                                    ContextHolder.unload();
                                }
                            });
                } else {
                    ContextHolder.unload();
                }
            }
        }

    }

    private static void enableOrganismeRessourceFilter(final String userOrganismesHeader, final Session session) {
        String userOrganismes = userOrganismesHeader + "," + Constantes.GENERIC_ORGANISME;
        List<String> organismesAndGeneric = List.of(userOrganismes.split(","));
        org.hibernate.Filter filter = session.enableFilter("organismeRessourceFilter");
        filter.setParameterList("organismesAndGeneric", organismesAndGeneric);
    }

    private static void enableOrgnanismeFilter(final String userOrganismesHeader, final Session session) {
        List<String> organismes = List.of(userOrganismesHeader.split(","));
        org.hibernate.Filter filter = session.enableFilter("organismeFilter");
        filter.setParameterList("organisme", organismes);
    }

    private void addContext(final ServletRequest request) {
        Context context = new Context();
        context.setHost(request.getRemoteHost());
        ContextHolder.setContext(context);

        if (request instanceof HttpServletRequest) {
            String userLogin = ((HttpServletRequest) request).getHeader("user.login");
            if (userLogin != null && !userLogin.isEmpty()) {
                context.setUser(userLogin);
            }
            String userProfile = ((HttpServletRequest) request).getHeader("profile");
            if (userProfile != null && !userProfile.isEmpty()) {
                context.setProfileFromString(userProfile);
            }
        }
    }
}
