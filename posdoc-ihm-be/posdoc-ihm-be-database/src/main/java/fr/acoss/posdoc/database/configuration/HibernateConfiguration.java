package fr.acoss.posdoc.database.configuration;

import fr.acoss.posdoc.database.interceptor.ActionInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class HibernateConfiguration implements HibernatePropertiesCustomizer {

    private ActionInterceptor myInterceptor;

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put("hibernate.session_factory.interceptor", myInterceptor);
    }

    @Autowired
    public void setMyInterceptor(@Lazy ActionInterceptor myInterceptor) {
        this.myInterceptor = myInterceptor;
    }
}