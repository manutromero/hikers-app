## Sub-Task MT-2.8: Database Indexes and Performance Optimization

### Objective
Implement comprehensive database performance optimization including strategic indexing, query optimization, and performance monitoring for the mountain climber training app database.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This implements performance optimization layer to ensure fast and efficient database operations across all tables and queries.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: High
**Developer Type**: Backend/Performance

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-4 (Wearable Data and Device Integration Tables)
- [ ] ST-MT-2-5 (Training and Readiness Assessment Tables)
- [ ] All core tables created and populated with sample data

**Outputs Needed By**:
- ST-MT-2-9 (OAuth Providers Configuration)
- ST-MT-2-10 (Storage Buckets and Real-time Setup)

### Acceptance Criteria
- [ ] Performance indexes created for all tables
- [ ] Composite indexes for complex queries implemented
- [ ] Query performance optimization completed
- [ ] Database monitoring setup implemented
- [ ] Performance benchmarks established
- [ ] Query execution plans analyzed
- [ ] Performance testing completed
- [ ] Optimization documentation created

### Technical Implementation

**Architecture Context**:
This sub-task implements the performance optimization layer of the hexagonal architecture, ensuring efficient data access patterns and query performance.

**Files to Create/Modify**:
```
supabase/
├── migrations/
│   └── 20240115000008_performance_optimization.sql
├── functions/
│   └── performance_functions.sql
├── monitoring/
│   ├── performance_views.sql
│   └── query_analysis.sql
└── optimization/
    └── performance_config.sql
```

**Step-by-Step Implementation**:

1. **Create Performance Optimization Migration**
   ```sql
   -- supabase/migrations/20240115000008_performance_optimization.sql
   
   -- Composite indexes for complex queries
   
   -- User profile and training optimization
   CREATE INDEX idx_user_training_composite ON training_plans(user_id, is_active, target_date);
   CREATE INDEX idx_user_sessions_composite ON training_sessions(user_id, scheduled_date, is_completed);
   CREATE INDEX idx_user_readiness_composite ON readiness_scores(user_id, mountain_id, assessment_date);
   
   -- Wearable data optimization
   CREATE INDEX idx_wearable_data_composite ON wearable_data(user_id, data_type, recorded_at);
   CREATE INDEX idx_wearable_device_composite ON wearable_devices(user_id, device_type, is_active);
   CREATE INDEX idx_sync_queue_composite ON sync_queue(user_id, status, priority, created_at);
   
   -- Content optimization
   CREATE INDEX idx_video_content_composite ON video_content(content_type, difficulty_level, is_active);
   CREATE INDEX idx_content_analytics_composite ON content_analytics(user_id, video_id, event_type, event_timestamp);
   CREATE INDEX idx_content_cache_composite ON content_cache(user_id, cache_status, expires_at);
   
   -- Authentication optimization
   CREATE INDEX idx_user_sessions_composite ON user_sessions(user_id, is_active, expires_at);
   CREATE INDEX idx_user_roles_composite ON user_roles(user_id, role_name, is_active);
   CREATE INDEX idx_login_history_composite ON user_login_history(user_id, login_method, created_at);
   
   -- Partial indexes for active records
   CREATE INDEX idx_active_training_plans ON training_plans(user_id, target_date) WHERE is_active = true;
   CREATE INDEX idx_active_wearable_devices ON wearable_devices(user_id, device_type) WHERE is_active = true;
   CREATE INDEX idx_active_video_content ON video_content(content_type, difficulty_level) WHERE is_active = true;
   
   -- Functional indexes for common queries
   CREATE INDEX idx_user_email_lower ON user_profiles(LOWER(email));
   CREATE INDEX idx_mountain_name_lower ON mountains(LOWER(name));
   CREATE INDEX idx_video_title_lower ON video_content(LOWER(title));
   
   -- Date range indexes for time-based queries
   CREATE INDEX idx_training_sessions_date_range ON training_sessions(scheduled_date, user_id) WHERE scheduled_date >= CURRENT_DATE - INTERVAL '90 days';
   CREATE INDEX idx_wearable_data_date_range ON wearable_data(recorded_at, user_id) WHERE recorded_at >= CURRENT_DATE - INTERVAL '30 days';
   CREATE INDEX idx_readiness_scores_date_range ON readiness_scores(assessment_date, user_id) WHERE assessment_date >= CURRENT_DATE - INTERVAL '180 days';
   ```

2. **Create Performance Monitoring Views**
   ```sql
   -- supabase/monitoring/performance_views.sql
   
   -- View for slow queries analysis
   CREATE OR REPLACE VIEW slow_queries_analysis AS
   SELECT 
       query,
       calls,
       total_time,
       mean_time,
       rows,
       100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
   FROM pg_stat_statements
   WHERE mean_time > 100  -- Queries taking more than 100ms on average
   ORDER BY mean_time DESC;
   
   -- View for table access patterns
   CREATE OR REPLACE VIEW table_access_patterns AS
   SELECT 
       schemaname,
       tablename,
       seq_scan,
       seq_tup_read,
       idx_scan,
       idx_tup_fetch,
       n_tup_ins,
       n_tup_upd,
       n_tup_del,
       n_live_tup,
       n_dead_tup,
       last_vacuum,
       last_autovacuum,
       last_analyze,
       last_autoanalyze
   FROM pg_stat_user_tables
   ORDER BY n_live_tup DESC;
   
   -- View for index usage statistics
   CREATE OR REPLACE VIEW index_usage_stats AS
   SELECT 
       schemaname,
       tablename,
       indexname,
       idx_scan,
       idx_tup_read,
       idx_tup_fetch,
       pg_size_pretty(pg_relation_size(indexrelid)) as index_size
   FROM pg_stat_user_indexes
   ORDER BY idx_scan DESC;
   
   -- View for database size analysis
   CREATE OR REPLACE VIEW database_size_analysis AS
   SELECT 
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
       pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
       pg_total_relation_size(schemaname||'.'||tablename) as total_size_bytes
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Create Performance Functions**
   ```sql
   -- supabase/functions/performance_functions.sql
   
   -- Function to analyze query performance
   CREATE OR REPLACE FUNCTION analyze_query_performance(query_text TEXT)
   RETURNS TABLE (
       plan_type TEXT,
       cost DECIMAL,
       rows BIGINT,
       width INTEGER,
       node_type TEXT
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           'EXPLAIN'::TEXT as plan_type,
           (regexp_matches(plan_line, 'cost=([0-9.]+)\.\.([0-9.]+)'))[1]::DECIMAL as cost,
           (regexp_matches(plan_line, 'rows=([0-9]+)'))[1]::BIGINT as rows,
           (regexp_matches(plan_line, 'width=([0-9]+)'))[1]::INTEGER as width,
           (regexp_matches(plan_line, '^([A-Za-z ]+)'))[1]::TEXT as node_type
       FROM (
           SELECT unnest(string_to_array(pg_explain_query(query_text), E'\n')) as plan_line
       ) as plan_lines
       WHERE plan_line ~ 'cost=';
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get table statistics
   CREATE OR REPLACE FUNCTION get_table_stats(table_name TEXT)
   RETURNS TABLE (
       metric_name TEXT,
       metric_value BIGINT,
       description TEXT
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           'total_rows'::TEXT,
           n_live_tup,
           'Total live rows in table'::TEXT
       FROM pg_stat_user_tables
       WHERE tablename = table_name
       
       UNION ALL
       
       SELECT 
           'dead_rows'::TEXT,
           n_dead_tup,
           'Total dead rows in table'::TEXT
       FROM pg_stat_user_tables
       WHERE tablename = table_name
       
       UNION ALL
       
       SELECT 
           'sequential_scans'::TEXT,
           seq_scan,
           'Number of sequential scans'::TEXT
       FROM pg_stat_user_tables
       WHERE tablename = table_name
       
       UNION ALL
       
       SELECT 
           'index_scans'::TEXT,
           idx_scan,
           'Number of index scans'::TEXT
       FROM pg_stat_user_tables
       WHERE tablename = table_name;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to clean up old data
   CREATE OR REPLACE FUNCTION cleanup_old_data(
       p_days_to_keep INTEGER DEFAULT 365
   )
   RETURNS TABLE (
       table_name TEXT,
       deleted_rows INTEGER
   ) AS $$
   DECLARE
       cleanup_date DATE;
       deleted_count INTEGER;
   BEGIN
       cleanup_date := CURRENT_DATE - (p_days_to_keep || ' days')::INTERVAL;
       
       -- Clean up old login history
       DELETE FROM user_login_history WHERE created_at < cleanup_date;
       GET DIAGNOSTICS deleted_count = ROW_COUNT;
       RETURN QUERY SELECT 'user_login_history'::TEXT, deleted_count;
       
       -- Clean up old content analytics (keep 90 days)
       DELETE FROM content_analytics WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
       GET DIAGNOSTICS deleted_count = ROW_COUNT;
       RETURN QUERY SELECT 'content_analytics'::TEXT, deleted_count;
       
       -- Clean up expired cache entries
       DELETE FROM content_cache WHERE expires_at < NOW();
       GET DIAGNOSTICS deleted_count = ROW_COUNT;
       RETURN QUERY SELECT 'content_cache'::TEXT, deleted_count;
       
       -- Clean up old device connection history
       DELETE FROM device_connection_history WHERE created_at < cleanup_date;
       GET DIAGNOSTICS deleted_count = ROW_COUNT;
       RETURN QUERY SELECT 'device_connection_history'::TEXT, deleted_count;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Create Query Analysis Functions**
   ```sql
   -- supabase/monitoring/query_analysis.sql
   
   -- Function to find unused indexes
   CREATE OR REPLACE FUNCTION find_unused_indexes()
   RETURNS TABLE (
       schemaname TEXT,
       tablename TEXT,
       indexname TEXT,
       index_size TEXT,
       last_used TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           ui.schemaname::TEXT,
           ui.tablename::TEXT,
           ui.indexname::TEXT,
           pg_size_pretty(pg_relation_size(ui.indexrelid))::TEXT as index_size,
           COALESCE(ps.last_used, '1970-01-01'::TIMESTAMP WITH TIME ZONE) as last_used
       FROM pg_stat_user_indexes ui
       LEFT JOIN pg_stat_statements ps ON ps.query LIKE '%' || ui.indexname || '%'
       WHERE ui.idx_scan = 0
           AND ui.indexname NOT LIKE '%_pkey'
           AND ui.indexname NOT LIKE '%_unique'
       ORDER BY pg_relation_size(ui.indexrelid) DESC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to analyze table bloat
   CREATE OR REPLACE FUNCTION analyze_table_bloat()
   RETURNS TABLE (
       tablename TEXT,
       table_size TEXT,
       index_size TEXT,
       total_size TEXT,
       bloat_ratio DECIMAL(5,2)
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           t.tablename::TEXT,
           pg_size_pretty(pg_relation_size(t.schemaname||'.'||t.tablename))::TEXT as table_size,
           pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename) - pg_relation_size(t.schemaname||'.'||t.tablename))::TEXT as index_size,
           pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename))::TEXT as total_size,
           CASE 
               WHEN pg_relation_size(t.schemaname||'.'||t.tablename) > 0 
               THEN (st.n_dead_tup::DECIMAL / st.n_live_tup::DECIMAL) * 100
               ELSE 0
           END as bloat_ratio
       FROM pg_tables t
       JOIN pg_stat_user_tables st ON t.tablename = st.tablename
       WHERE t.schemaname = 'public'
           AND st.n_live_tup > 0
       ORDER BY bloat_ratio DESC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Create Performance Configuration**
   ```sql
   -- supabase/optimization/performance_config.sql
   
   -- Set performance-related configuration parameters
   ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
   ALTER SYSTEM SET track_activities = on;
   ALTER SYSTEM SET track_counts = on;
   ALTER SYSTEM SET track_io_timing = on;
   ALTER SYSTEM SET track_functions = all;
   ALTER SYSTEM SET log_statement = 'all';
   ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries taking more than 1 second
   
   -- Memory configuration
   ALTER SYSTEM SET shared_buffers = '256MB';
   ALTER SYSTEM SET effective_cache_size = '1GB';
   ALTER SYSTEM SET work_mem = '4MB';
   ALTER SYSTEM SET maintenance_work_mem = '64MB';
   
   -- WAL configuration
   ALTER SYSTEM SET wal_buffers = '16MB';
   ALTER SYSTEM SET checkpoint_completion_target = 0.9;
   ALTER SYSTEM SET wal_writer_delay = '200ms';
   
   -- Query planner configuration
   ALTER SYSTEM SET random_page_cost = 1.1;
   ALTER SYSTEM SET effective_io_concurrency = 200;
   ALTER SYSTEM SET default_statistics_target = 100;
   
   -- Autovacuum configuration
   ALTER SYSTEM SET autovacuum = on;
   ALTER SYSTEM SET autovacuum_max_workers = 3;
   ALTER SYSTEM SET autovacuum_naptime = '1min';
   ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;
   ALTER SYSTEM SET autovacuum_analyze_threshold = 50;
   ```

6. **Create Performance Testing Queries**
   ```sql
   -- Performance test queries for validation
   
   -- Test 1: User training plan retrieval
   EXPLAIN (ANALYZE, BUFFERS) 
   SELECT tp.*, m.name as mountain_name
   FROM training_plans tp
   JOIN mountains m ON tp.mountain_id = m.id
   WHERE tp.user_id = 'test-user-id'
       AND tp.is_active = true
   ORDER BY tp.target_date ASC;
   
   -- Test 2: Wearable data aggregation
   EXPLAIN (ANALYZE, BUFFERS)
   SELECT 
       data_type,
       AVG(value) as avg_value,
       COUNT(*) as data_points
   FROM wearable_data
   WHERE user_id = 'test-user-id'
       AND recorded_at >= CURRENT_DATE - INTERVAL '30 days'
   GROUP BY data_type;
   
   -- Test 3: Readiness score calculation
   EXPLAIN (ANALYZE, BUFFERS)
   SELECT 
       rs.overall_score,
       rs.readiness_status,
       m.name as mountain_name
   FROM readiness_scores rs
   JOIN mountains m ON rs.mountain_id = m.id
   WHERE rs.user_id = 'test-user-id'
       AND rs.assessment_date >= CURRENT_DATE - INTERVAL '90 days'
   ORDER BY rs.assessment_date DESC;
   
   -- Test 4: Content recommendation
   EXPLAIN (ANALYZE, BUFFERS)
   SELECT vc.*
   FROM video_content vc
   LEFT JOIN user_content_history uch ON vc.id = uch.video_id AND uch.user_id = 'test-user-id'
   WHERE vc.is_active = true
       AND uch.id IS NULL
   ORDER BY vc.is_featured DESC, vc.view_count DESC
   LIMIT 10;
   ```

**Key Implementation Details**:
- **Design Patterns**: Performance optimization pattern, monitoring pattern
- **Error Handling**: Performance monitoring and alerting
- **Data Validation**: Query performance validation
- **Performance Considerations**: Strategic indexing, query optimization, monitoring

### Testing Requirements

**Unit Tests**:
- [ ] Index creation and validation tests
- [ ] Query performance tests
- [ ] Monitoring function tests
- [ ] Cleanup function tests

**Integration Tests**:
- [ ] End-to-end performance tests
- [ ] Load testing with sample data
- [ ] Query execution plan analysis

**Manual Testing Steps**:
1. Test index creation and validation
2. Verify query performance improvements
3. Test monitoring functions
4. Validate cleanup procedures
5. Analyze query execution plans

### Code Quality Standards

**Code Requirements**:
- [ ] Follow PostgreSQL performance best practices
- [ ] Use efficient indexing strategies
- [ ] Implement proper monitoring
- [ ] Add performance documentation
- [ ] Ensure query optimization

**Security Requirements**:
- [ ] Secure monitoring access
- [ ] Performance data protection
- [ ] Query analysis security

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All performance indexes created and tested
- [ ] Monitoring system implemented
- [ ] Performance benchmarks established
- [ ] Query optimization completed
- [ ] Performance testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- Index overhead - Mitigation: Monitor index usage and remove unused indexes
- Query complexity - Mitigation: Use query analysis tools
- Performance monitoring overhead - Mitigation: Use efficient monitoring queries

**Research Required**:
- PostgreSQL performance tuning best practices
- Index optimization strategies
- Query performance analysis techniques

### Additional Resources
**Reference Materials**:
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance.html)
- [Index Optimization Guide](https://www.postgresql.org/docs/current/indexes.html)
- [Query Performance Analysis](https://www.postgresql.org/docs/current/using-explain.html)

**Related Code**:
- All database tables from previous sub-tasks
- RLS policies from ST-MT-2-7
- Storage configuration from ST-MT-2-10 