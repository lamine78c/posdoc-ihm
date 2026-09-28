package fr.acoss.posdoc.ws.resolvers;


import graphql.kickstart.tools.GraphQLQueryResolver;

public abstract class AbstractQueryResolver extends BaseResolver implements GraphQLQueryResolver {
    protected AbstractQueryResolver() {
        super();
    }
}
