DO $$
    DECLARE
        current_db TEXT;
    BEGIN
        SELECT current_database() INTO current_db;

        IF current_db NOT LIKE '%e2e%' THEN
            RAISE EXCEPTION 'Base: <%>  -  Elle ne correspond pas a une base e2e.',
                current_db;
        END IF;

        RAISE NOTICE 'Base contenant e2e: %', current_db;
    END $$;