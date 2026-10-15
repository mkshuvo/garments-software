-- Asserts that a freshly migrated database actually enforces tenant isolation.
--
-- Running the migrations and stopping would only prove the schema applies. This checks the property
-- that matters: policies exist, they are forced onto the tables, and the runtime principal cannot
-- step around them. A deployment where garments_app turned out to be a superuser would migrate
-- cleanly, serve every request, and leak every tenant's data.
--
-- Used by verify-all.sh and by CI. Raises, so psql -v ON_ERROR_STOP=1 exits non-zero.

do $$
declare
    policy_count   integer;
    forced_count   integer;
    app_can_bypass boolean;
    app_exists     boolean;
begin
    select exists (select 1 from pg_roles where rolname = 'garments_app') into app_exists;
    if not app_exists then
        raise exception 'runtime role garments_app does not exist; the app must not connect as a superuser';
    end if;

    select rolbypassrls or rolsuper into app_can_bypass from pg_roles where rolname = 'garments_app';
    if app_can_bypass then
        raise exception 'garments_app can bypass row level security, so every policy below is decoration';
    end if;

    select count(*) into policy_count
        from pg_policies
        where schemaname = 'public' and policyname = 'tenant_isolation';
    if policy_count = 0 then
        raise exception 'no tenant_isolation policy exists in the public schema';
    end if;

    select count(*) into forced_count
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r' and c.relforcerowsecurity;
    if forced_count = 0 then
        raise exception 'no table forces row level security; the table owner would read across tenants';
    end if;

    -- Every tenant-owned table must be covered, not merely some of them. The count is compared
    -- against the tables that actually carry the column, so a new entity that forgets its policy
    -- fails here rather than shipping as a quiet leak.
    if policy_count <> (
        select count(distinct t.table_name)
        from information_schema.columns t
        where t.table_schema = 'public' and t.column_name = 'tenant_id'
    ) then
        raise exception 'tenant_isolation covers % tables but % tables carry tenant_id',
            policy_count,
            (select count(distinct t.table_name) from information_schema.columns t
              where t.table_schema = 'public' and t.column_name = 'tenant_id');
    end if;

    raise notice 'row level security verified: % policies across % forced tables', policy_count, forced_count;
end
$$;

-- The functional check. Reading as the runtime role with no tenant resolved must yield nothing.
-- A bare `if` is not SQL, so this lives inside its own plpgsql block.
do $$
begin
    set role garments_app;

    if exists (select 1 from users) then
        reset role;
        raise exception 'an unset tenant exposed rows: row level security is not failing closed';
    end if;

    reset role;
end
$$;
