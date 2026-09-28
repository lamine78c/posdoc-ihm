package fr.acoss.posdoc;

import com.graphql.spring.boot.test.GraphQLTestAutoConfiguration;
import com.graphql.spring.boot.test.GraphQLTestTemplate;
import fr.acoss.posdoc.ws.PosdocIhmBeApplication;
import fr.acoss.posdoc.configuration.AdelaideConfiguration;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {
        PosdocIhmBeApplication.class,
        GraphQLTestAutoConfiguration.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
        ,properties = "spring.main.allow-bean-definition-overriding=true"
)
@Import({AdelaideConfiguration.class} )
@ActiveProfiles("test")
public abstract class AbstractAdelaideTest {
    @Autowired
    protected GraphQLTestTemplate graphQLTestTemplate;
}
