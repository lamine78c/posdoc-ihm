package fr.acoss.posdoc.database.entities.converters;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.*;

/**
 * Type générique pour mapper les enums dans PostgreSQL et H2 avec Hibernate.
 */
public class GenericPostgreSQLEnumType<E extends Enum<E>> implements UserType {

    private final Class<E> enumClass;
    private static final int SQL_TYPE_H2 = Types.VARCHAR;

    public GenericPostgreSQLEnumType(Class<E> enumClass) {
        this.enumClass = enumClass;
    }

    @Override
    public int[] sqlTypes() {
        return new int[]{Types.OTHER}; // Par défaut PostgreSQL
    }

    @Override
    public Class<E> returnedClass() {
        return enumClass;
    }

    @Override
    public Object nullSafeGet(ResultSet rs, String[] names, SharedSessionContractImplementor session, Object owner) throws SQLException {
        String value = rs.getString(names[0]);
        return value != null ? Enum.valueOf(enumClass, value) : null;
    }

    @Override
    public void nullSafeSet(PreparedStatement st, Object value, int index, SharedSessionContractImplementor session) throws SQLException {
        if (value == null) {
            st.setNull(index, getSqlType(session));
        } else {
            st.setObject(index, ((Enum<?>) value).name(), getSqlType(session));
        }
    }

    private int getSqlType(SharedSessionContractImplementor session) {
        String dbName = session.getJdbcServices().getDialect().getClass().getSimpleName();
        return dbName.contains("Postgre") ? Types.OTHER : SQL_TYPE_H2;
    }

    @Override
    public Object deepCopy(Object value) {
        return value; // Les enums sont immuables
    }

    @Override
    public boolean isMutable() {
        return false;
    }

    @Override
    public Serializable disassemble(Object value) {
        return (Serializable) value;
    }

    @Override
    public Object assemble(Serializable cached, Object owner) {
        return cached;
    }

    @Override
    public Object replace(Object original, Object target, Object owner) {
        return original;
    }

    @Override
    public boolean equals(Object x, Object y) {
        return x == y || (x != null && x.equals(y));
    }

    @Override
    public int hashCode(Object x) {
        return x != null ? x.hashCode() : 0;
    }
}