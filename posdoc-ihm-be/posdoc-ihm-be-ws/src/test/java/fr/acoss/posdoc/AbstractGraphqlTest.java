package fr.acoss.posdoc;

import com.graphql.spring.boot.test.GraphQLTestAutoConfiguration;
import com.graphql.spring.boot.test.GraphQLTestTemplate;
import fr.acoss.posdoc.ws.PosdocIhmBeApplication;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlMergeMode;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {
        PosdocIhmBeApplication.class,
        GraphQLTestAutoConfiguration.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Sql(scripts = "classpath:sql/_purge-all.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@SqlMergeMode(SqlMergeMode.MergeMode.MERGE)
public abstract class AbstractGraphqlTest {

    @Autowired
    protected GraphQLTestTemplate graphQLTestTemplate;

}
