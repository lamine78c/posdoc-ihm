package fr.acoss.posdoc.ws.resolvers;


import graphql.kickstart.tools.GraphQLMutationResolver;
import graphql.kickstart.tools.GraphQLQueryResolver;

public abstract class AbstractResolver extends BaseResolver implements GraphQLMutationResolver, GraphQLQueryResolver {
    protected AbstractResolver() {
        super();
    }
}
