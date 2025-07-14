## Sub-Task MT-2.4: Wearable Data and Device Integration Tables

### Objective
Create and implement database tables for wearable device integration, data storage, and synchronization management for Garmin Connect and Apple HealthKit data.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This implements the data layer for wearable device integration, enabling storage and management of fitness data from various wearable devices.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-2 (Database Schema Design and Core Tables)
- [ ] User profiles table created and configured

**Outputs Needed By**:
- ST-MT-2-8 (Database Indexes and Performance Optimization)
- ST-MT-2-7 (Row Level Security (RLS) Policies Implementation)

### Acceptance Criteria
- [ ] Wearable devices table created
- [ ] Wearable data storage tables implemented
- [ ] Device connection tracking table created
- [ ] Data synchronization tables implemented
- [ ] Data normalization functions created
- [ ] Sync status tracking implemented
- [ ] Database migration files created and tested
- [ ] Performance optimization for data storage

### Technical Implementation

**Architecture Context**:
This sub-task implements the domain layer of the hexagonal architecture, defining the data structures for wearable device integration and fitness data management.

**Files to Create/Modify**:
```
supabase/
├── migrations/
│   └── 20240115000004_wearable_tables.sql
├── functions/
│   ├── wearable_functions.sql
│   └── sync_functions.sql
└── types/
    └── wearable_types.sql
```

**Step-by-Step Implementation**:

1. **Create Wearable Devices Table**
   ```sql
   -- supabase/migrations/20240115000004_wearable_tables.sql
   
   -- Wearable devices table
   CREATE TABLE wearable_devices (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('garmin', 'apple_watch', 'fitbit', 'other')),
       device_name VARCHAR(255) NOT NULL,
       device_model VARCHAR(255),
       device_serial VARCHAR(255),
       manufacturer VARCHAR(255),
       connection_status VARCHAR(50) DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'syncing')),
       last_sync_at TIMESTAMP WITH TIME ZONE,
       sync_frequency_minutes INTEGER DEFAULT 60,
       is_active BOOLEAN DEFAULT true,
       oauth_token JSONB,
       oauth_refresh_token TEXT,
       oauth_expires_at TIMESTAMP WITH TIME ZONE,
       device_settings JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Wearable data table for storing fitness metrics
   CREATE TABLE wearable_data (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       device_id UUID NOT NULL REFERENCES wearable_devices(id) ON DELETE CASCADE,
       data_type VARCHAR(100) NOT NULL CHECK (data_type IN (
           'heart_rate', 'steps', 'calories', 'distance', 'elevation', 
           'sleep', 'stress', 'vo2_max', 'hrv', 'temperature',
           'blood_oxygen', 'respiratory_rate', 'activity_minutes'
       )),
       value DECIMAL(10, 4) NOT NULL,
       unit VARCHAR(20) NOT NULL,
       recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
       source_timestamp TIMESTAMP WITH TIME ZONE,
       data_quality VARCHAR(20) DEFAULT 'good' CHECK (data_quality IN ('excellent', 'good', 'fair', 'poor')),
       metadata JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Device connection history table
   CREATE TABLE device_connection_history (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       device_id UUID NOT NULL REFERENCES wearable_devices(id) ON DELETE CASCADE,
       connection_event VARCHAR(50) NOT NULL CHECK (connection_event IN ('connected', 'disconnected', 'sync_started', 'sync_completed', 'sync_failed', 'auth_expired')),
       event_details JSONB,
       error_message TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Data synchronization queue table
   CREATE TABLE sync_queue (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       device_id UUID NOT NULL REFERENCES wearable_devices(id) ON DELETE CASCADE,
       sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
       status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
       priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
       data_range_start TIMESTAMP WITH TIME ZONE,
       data_range_end TIMESTAMP WITH TIME ZONE,
       retry_count INTEGER DEFAULT 0,
       max_retries INTEGER DEFAULT 3,
       error_message TEXT,
       processed_at TIMESTAMP WITH TIME ZONE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Data aggregation table for performance optimization
   CREATE TABLE wearable_data_aggregated (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       device_id UUID NOT NULL REFERENCES wearable_devices(id) ON DELETE CASCADE,
       data_type VARCHAR(100) NOT NULL,
       aggregation_period VARCHAR(20) NOT NULL CHECK (aggregation_period IN ('hour', 'day', 'week', 'month')),
       period_start TIMESTAMP WITH TIME ZONE NOT NULL,
       period_end TIMESTAMP WITH TIME ZONE NOT NULL,
       avg_value DECIMAL(10, 4),
       min_value DECIMAL(10, 4),
       max_value DECIMAL(10, 4),
       sum_value DECIMAL(10, 4),
       count_records INTEGER,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id, device_id, data_type, aggregation_period, period_start)
   );
   ```

2. **Create Indexes for Performance**
   ```sql
   -- Wearable devices indexes
   CREATE INDEX idx_wearable_devices_user_id ON wearable_devices(user_id);
   CREATE INDEX idx_wearable_devices_type ON wearable_devices(device_type);
   CREATE INDEX idx_wearable_devices_status ON wearable_devices(connection_status);
   CREATE INDEX idx_wearable_devices_last_sync ON wearable_devices(last_sync_at);
   
   -- Wearable data indexes
   CREATE INDEX idx_wearable_data_user_id ON wearable_data(user_id);
   CREATE INDEX idx_wearable_data_device_id ON wearable_data(device_id);
   CREATE INDEX idx_wearable_data_type ON wearable_data(data_type);
   CREATE INDEX idx_wearable_data_recorded_at ON wearable_data(recorded_at);
   CREATE INDEX idx_wearable_data_user_type_time ON wearable_data(user_id, data_type, recorded_at);
   
   -- Device connection history indexes
   CREATE INDEX idx_device_connection_device_id ON device_connection_history(device_id);
   CREATE INDEX idx_device_connection_event ON device_connection_history(connection_event);
   CREATE INDEX idx_device_connection_created_at ON device_connection_history(created_at);
   
   -- Sync queue indexes
   CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
   CREATE INDEX idx_sync_queue_status ON sync_queue(status);
   CREATE INDEX idx_sync_queue_priority ON sync_queue(priority);
   CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
   
   -- Aggregated data indexes
   CREATE INDEX idx_wearable_aggregated_user_id ON wearable_data_aggregated(user_id);
   CREATE INDEX idx_wearable_aggregated_type_period ON wearable_data_aggregated(data_type, aggregation_period);
   CREATE INDEX idx_wearable_aggregated_period_start ON wearable_data_aggregated(period_start);
   CREATE INDEX idx_wearable_aggregated_user_type_period ON wearable_data_aggregated(user_id, data_type, aggregation_period, period_start);
   ```

3. **Create Wearable Data Functions**
   ```sql
   -- supabase/functions/wearable_functions.sql
   
   -- Function to get user's wearable devices
   CREATE OR REPLACE FUNCTION get_user_wearable_devices(user_id UUID)
   RETURNS TABLE (
       device_id UUID,
       device_type VARCHAR(50),
       device_name VARCHAR(255),
       connection_status VARCHAR(50),
       last_sync_at TIMESTAMP WITH TIME ZONE,
       is_active BOOLEAN
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           wd.id,
           wd.device_type,
           wd.device_name,
           wd.connection_status,
           wd.last_sync_at,
           wd.is_active
       FROM wearable_devices wd
       WHERE wd.user_id = get_user_wearable_devices.user_id
           AND wd.is_active = true;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get wearable data for a specific period
   CREATE OR REPLACE FUNCTION get_wearable_data(
       p_user_id UUID,
       p_data_type VARCHAR(100),
       p_start_time TIMESTAMP WITH TIME ZONE,
       p_end_time TIMESTAMP WITH TIME ZONE,
       p_device_id UUID DEFAULT NULL
   )
   RETURNS TABLE (
       data_id UUID,
       device_id UUID,
       data_type VARCHAR(100),
       value DECIMAL(10, 4),
       unit VARCHAR(20),
       recorded_at TIMESTAMP WITH TIME ZONE,
       data_quality VARCHAR(20)
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           wd.id,
           wd.device_id,
           wd.data_type,
           wd.value,
           wd.unit,
           wd.recorded_at,
           wd.data_quality
       FROM wearable_data wd
       WHERE wd.user_id = p_user_id
           AND wd.data_type = p_data_type
           AND wd.recorded_at BETWEEN p_start_time AND p_end_time
           AND (p_device_id IS NULL OR wd.device_id = p_device_id)
       ORDER BY wd.recorded_at ASC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to insert wearable data
   CREATE OR REPLACE FUNCTION insert_wearable_data(
       p_user_id UUID,
       p_device_id UUID,
       p_data_type VARCHAR(100),
       p_value DECIMAL(10, 4),
       p_unit VARCHAR(20),
       p_recorded_at TIMESTAMP WITH TIME ZONE,
       p_data_quality VARCHAR(20) DEFAULT 'good',
       p_metadata JSONB DEFAULT NULL
   )
   RETURNS UUID AS $$
   DECLARE
       data_id UUID;
   BEGIN
       INSERT INTO wearable_data (
           user_id,
           device_id,
           data_type,
           value,
           unit,
           recorded_at,
           data_quality,
           metadata
       ) VALUES (
           p_user_id,
           p_device_id,
           p_data_type,
           p_value,
           p_unit,
           p_recorded_at,
           p_data_quality,
           p_metadata
       ) RETURNING id INTO data_id;
       
       RETURN data_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to update device connection status
   CREATE OR REPLACE FUNCTION update_device_connection_status(
       p_device_id UUID,
       p_status VARCHAR(50),
       p_event_details JSONB DEFAULT NULL
   )
   RETURNS BOOLEAN AS $$
   BEGIN
       -- Update device status
       UPDATE wearable_devices 
       SET 
           connection_status = p_status,
           last_sync_at = CASE WHEN p_status = 'connected' THEN NOW() ELSE last_sync_at END,
           updated_at = NOW()
       WHERE id = p_device_id;
       
       -- Log connection event
       INSERT INTO device_connection_history (
           device_id,
           connection_event,
           event_details
       ) VALUES (
           p_device_id,
           p_status,
           p_event_details
       );
       
       RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Create Synchronization Functions**
   ```sql
   -- supabase/functions/sync_functions.sql
   
   -- Function to add sync job to queue
   CREATE OR REPLACE FUNCTION add_sync_job(
       p_user_id UUID,
       p_device_id UUID,
       p_sync_type VARCHAR(50),
       p_priority INTEGER DEFAULT 5,
       p_data_range_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
       p_data_range_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
   )
   RETURNS UUID AS $$
   DECLARE
       job_id UUID;
   BEGIN
       INSERT INTO sync_queue (
           user_id,
           device_id,
           sync_type,
           priority,
           data_range_start,
           data_range_end
       ) VALUES (
           p_user_id,
           p_device_id,
           p_sync_type,
           p_priority,
           p_data_range_start,
           p_data_range_end
       ) RETURNING id INTO job_id;
       
       RETURN job_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get pending sync jobs
   CREATE OR REPLACE FUNCTION get_pending_sync_jobs(limit_count INTEGER DEFAULT 10)
   RETURNS TABLE (
       job_id UUID,
       user_id UUID,
       device_id UUID,
       sync_type VARCHAR(50),
       priority INTEGER,
       created_at TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           sq.id,
           sq.user_id,
           sq.device_id,
           sq.sync_type,
           sq.priority,
           sq.created_at
       FROM sync_queue sq
       WHERE sq.status = 'pending'
       ORDER BY sq.priority DESC, sq.created_at ASC
       LIMIT limit_count;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to update sync job status
   CREATE OR REPLACE FUNCTION update_sync_job_status(
       p_job_id UUID,
       p_status VARCHAR(50),
       p_error_message TEXT DEFAULT NULL
   )
   RETURNS BOOLEAN AS $$
   BEGIN
       UPDATE sync_queue 
       SET 
           status = p_status,
           processed_at = CASE WHEN p_status IN ('completed', 'failed') THEN NOW() ELSE processed_at END,
           error_message = p_error_message,
           updated_at = NOW()
       WHERE id = p_job_id;
       
       RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to aggregate wearable data
   CREATE OR REPLACE FUNCTION aggregate_wearable_data(
       p_user_id UUID,
       p_data_type VARCHAR(100),
       p_aggregation_period VARCHAR(20),
       p_start_time TIMESTAMP WITH TIME ZONE,
       p_end_time TIMESTAMP WITH TIME ZONE
   )
   RETURNS INTEGER AS $$
   DECLARE
       affected_rows INTEGER;
   BEGIN
       INSERT INTO wearable_data_aggregated (
           user_id,
           device_id,
           data_type,
           aggregation_period,
           period_start,
           period_end,
           avg_value,
           min_value,
           max_value,
           sum_value,
           count_records
       )
       SELECT 
           wd.user_id,
           wd.device_id,
           wd.data_type,
           p_aggregation_period,
           date_trunc(p_aggregation_period, wd.recorded_at) as period_start,
           date_trunc(p_aggregation_period, wd.recorded_at) + 
               CASE p_aggregation_period
                   WHEN 'hour' THEN INTERVAL '1 hour'
                   WHEN 'day' THEN INTERVAL '1 day'
                   WHEN 'week' THEN INTERVAL '1 week'
                   WHEN 'month' THEN INTERVAL '1 month'
               END as period_end,
           AVG(wd.value) as avg_value,
           MIN(wd.value) as min_value,
           MAX(wd.value) as max_value,
           SUM(wd.value) as sum_value,
           COUNT(*) as count_records
       FROM wearable_data wd
       WHERE wd.user_id = p_user_id
           AND wd.data_type = p_data_type
           AND wd.recorded_at BETWEEN p_start_time AND p_end_time
       GROUP BY wd.user_id, wd.device_id, wd.data_type, date_trunc(p_aggregation_period, wd.recorded_at)
       ON CONFLICT (user_id, device_id, data_type, aggregation_period, period_start)
       DO UPDATE SET
           avg_value = EXCLUDED.avg_value,
           min_value = EXCLUDED.min_value,
           max_value = EXCLUDED.max_value,
           sum_value = EXCLUDED.sum_value,
           count_records = EXCLUDED.count_records,
           updated_at = NOW();
       
       GET DIAGNOSTICS affected_rows = ROW_COUNT;
       RETURN affected_rows;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Create Data Type Definitions**
   ```sql
   -- supabase/types/wearable_types.sql
   
   -- Create custom types for wearable data
   CREATE TYPE wearable_device_type AS ENUM ('garmin', 'apple_watch', 'fitbit', 'other');
   CREATE TYPE wearable_data_type AS ENUM (
       'heart_rate', 'steps', 'calories', 'distance', 'elevation', 
       'sleep', 'stress', 'vo2_max', 'hrv', 'temperature',
       'blood_oxygen', 'respiratory_rate', 'activity_minutes'
   );
   CREATE TYPE connection_status_type AS ENUM ('connected', 'disconnected', 'error', 'syncing');
   CREATE TYPE sync_status_type AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
   CREATE TYPE data_quality_type AS ENUM ('excellent', 'good', 'fair', 'poor');
   ```

6. **Create Updated At Triggers**
   ```sql
   -- Create triggers for updated_at columns
   CREATE TRIGGER update_wearable_devices_updated_at BEFORE UPDATE ON wearable_devices
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_sync_queue_updated_at BEFORE UPDATE ON sync_queue
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_wearable_aggregated_updated_at BEFORE UPDATE ON wearable_data_aggregated
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

**Key Implementation Details**:
- **Design Patterns**: Repository pattern, queue pattern, aggregation pattern
- **Error Handling**: Comprehensive error handling for sync operations
- **Data Validation**: Proper constraints and data type validation
- **Performance Considerations**: Aggregation tables, strategic indexing, efficient queries

### Testing Requirements

**Unit Tests**:
- [ ] Wearable device management tests
- [ ] Data insertion and retrieval tests
- [ ] Sync queue management tests
- [ ] Aggregation function tests

**Integration Tests**:
- [ ] Device connection lifecycle tests
- [ ] Data synchronization tests
- [ ] Performance with large datasets

**Manual Testing Steps**:
1. Test device registration and management
2. Verify data insertion and retrieval
3. Test sync queue operations
4. Validate data aggregation
5. Test performance with sample data

### Code Quality Standards

**Code Requirements**:
- [ ] Follow PostgreSQL best practices
- [ ] Use consistent naming conventions
- [ ] Implement proper data validation
- [ ] Add comprehensive comments
- [ ] Ensure data integrity

**Security Requirements**:
- [ ] User data isolation
- [ ] Secure OAuth token storage
- [ ] Data access validation
- [ ] Audit trail for sync operations

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All wearable tables created and tested
- [ ] Functions and triggers implemented
- [ ] Performance optimization completed
- [ ] Data aggregation working
- [ ] Sync queue management functional
- [ ] Integration testing passed

### Potential Challenges
**Known Risks**:
- Large data volume performance - Mitigation: Implement aggregation and partitioning
- Sync queue bottlenecks - Mitigation: Implement priority queuing
- Data consistency issues - Mitigation: Use transactions and constraints

**Research Required**:
- Wearable device API patterns
- Data aggregation best practices
- Performance optimization techniques

### Additional Resources
**Reference Materials**:
- [Garmin Connect API Documentation](https://developer.garmin.com/connect-api/)
- [Apple HealthKit Documentation](https://developer.apple.com/health-fitness/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance.html)

**Related Code**:
- Core database schema from ST-MT-2-2
- User profiles from ST-MT-2-3
- RLS policies from ST-MT-2-7 