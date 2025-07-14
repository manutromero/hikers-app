## Sub-Task MT-2.2: Database Schema Design and Core Tables

### Objective
Design and implement the core database schema with essential tables for the mountain climber training app, including mountains, user profiles, and basic system tables.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This establishes the foundational data structure that all other features will build upon.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-1 (Supabase Project Setup and Configuration)
- [ ] Database connection established and tested

**Outputs Needed By**:
- ST-MT-2-3 (User Profile and Authentication Tables)
- ST-MT-2-4 (Wearable Data and Device Integration Tables)
- ST-MT-2-5 (Training and Readiness Assessment Tables)

### Acceptance Criteria
- [ ] Core database schema designed and documented
- [ ] Mountains table created with proper structure
- [ ] User profiles table created with essential fields
- [ ] System configuration table created
- [ ] Proper data types and constraints implemented
- [ ] Foreign key relationships established
- [ ] Database migration files created and tested
- [ ] Schema documentation updated

### Technical Implementation

**Architecture Context**:
This sub-task implements the domain layer of the hexagonal architecture, defining the core entities and their relationships.

**Files to Create/Modify**:
```
supabase/
├── migrations/
│   ├── 20240115000001_core_schema.sql
│   └── 20240115000002_seed_data.sql
├── seed.sql
└── schema/
    ├── mountains.sql
    ├── user_profiles.sql
    └── system_config.sql
```

**Step-by-Step Implementation**:

1. **Create Core Schema Migration**
   ```sql
   -- supabase/migrations/20240115000001_core_schema.sql
   
   -- Mountains table
   CREATE TABLE mountains (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       name VARCHAR(255) NOT NULL,
       elevation_meters INTEGER NOT NULL,
       difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('easy', 'moderate', 'hard', 'expert')),
       location_country VARCHAR(100) NOT NULL,
       location_region VARCHAR(100),
       coordinates_lat DECIMAL(10, 8),
       coordinates_lng DECIMAL(11, 8),
       description TEXT,
       estimated_climb_time_hours INTEGER,
       best_season VARCHAR(100),
       required_permits BOOLEAN DEFAULT false,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- User profiles table (extends Supabase auth.users)
   CREATE TABLE user_profiles (
       id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
       username VARCHAR(50) UNIQUE,
       first_name VARCHAR(100),
       last_name VARCHAR(100),
       email VARCHAR(255) UNIQUE NOT NULL,
       date_of_birth DATE,
       gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
       height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
       weight_kg DECIMAL(5,2) CHECK (weight_kg > 0 AND weight_kg < 500),
       fitness_level VARCHAR(50) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
       climbing_experience_years INTEGER DEFAULT 0,
       emergency_contact_name VARCHAR(200),
       emergency_contact_phone VARCHAR(50),
       emergency_contact_relationship VARCHAR(100),
       profile_image_url TEXT,
       is_profile_complete BOOLEAN DEFAULT false,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- System configuration table
   CREATE TABLE system_config (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       config_key VARCHAR(100) UNIQUE NOT NULL,
       config_value TEXT,
       config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
       description TEXT,
       is_public BOOLEAN DEFAULT false,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Create Indexes for Performance**
   ```sql
   -- Mountains indexes
   CREATE INDEX idx_mountains_difficulty ON mountains(difficulty_level);
   CREATE INDEX idx_mountains_country ON mountains(location_country);
   CREATE INDEX idx_mountains_elevation ON mountains(elevation_meters);
   
   -- User profiles indexes
   CREATE INDEX idx_user_profiles_email ON user_profiles(email);
   CREATE INDEX idx_user_profiles_username ON user_profiles(username);
   CREATE INDEX idx_user_profiles_fitness_level ON user_profiles(fitness_level);
   
   -- System config indexes
   CREATE INDEX idx_system_config_key ON system_config(config_key);
   CREATE INDEX idx_system_config_public ON system_config(is_public);
   ```

3. **Create Updated At Triggers**
   ```sql
   -- Function to update updated_at timestamp
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
   END;
   $$ language 'plpgsql';
   
   -- Create triggers for updated_at
   CREATE TRIGGER update_mountains_updated_at BEFORE UPDATE ON mountains
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

4. **Create Seed Data Migration**
   ```sql
   -- supabase/migrations/20240115000002_seed_data.sql
   
   -- Insert sample mountains
   INSERT INTO mountains (name, elevation_meters, difficulty_level, location_country, location_region, coordinates_lat, coordinates_lng, description, estimated_climb_time_hours, best_season, required_permits) VALUES
   ('Mount Everest', 8848, 'expert', 'Nepal', 'Khumbu', 27.9881, 86.9250, 'Highest peak in the world', 60, 'April-May, September-October', true),
   ('Mount Kilimanjaro', 5895, 'moderate', 'Tanzania', 'Kilimanjaro', -3.0674, 37.3556, 'Africa''s highest peak', 48, 'January-March, June-October', true),
   ('Mount Whitney', 4421, 'hard', 'USA', 'California', 36.5785, -118.2923, 'Highest peak in contiguous United States', 24, 'May-October', true),
   ('Mount Fuji', 3776, 'moderate', 'Japan', 'Chubu', 35.3606, 138.7274, 'Japan''s highest peak', 12, 'July-August', false);
   
   -- Insert system configuration
   INSERT INTO system_config (config_key, config_value, config_type, description, is_public) VALUES
   ('app_version', '1.0.0', 'string', 'Current app version', true),
   ('maintenance_mode', 'false', 'boolean', 'System maintenance mode', true),
   ('max_training_sessions_per_day', '3', 'number', 'Maximum training sessions allowed per day', true),
   ('readiness_score_threshold', '75', 'number', 'Minimum readiness score for summit attempt', true);
   ```

5. **Create Database Functions**
   ```sql
   -- Function to get user profile with auth data
   CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
   RETURNS TABLE (
       id UUID,
       username VARCHAR(50),
       first_name VARCHAR(100),
       last_name VARCHAR(100),
       email VARCHAR(255),
       fitness_level VARCHAR(50),
       is_profile_complete BOOLEAN
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           up.id,
           up.username,
           up.first_name,
           up.last_name,
           up.email,
           up.fitness_level,
           up.is_profile_complete
       FROM user_profiles up
       WHERE up.id = user_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

**Key Implementation Details**:
- **Design Patterns**: Domain-driven design, repository pattern foundation
- **Error Handling**: Database constraint validation, data integrity checks
- **Data Validation**: CHECK constraints, proper data types
- **Performance Considerations**: Strategic indexing, efficient queries

### Testing Requirements

**Unit Tests**:
- [ ] Database schema validation tests
- [ ] Constraint validation tests
- [ ] Index performance tests
- [ ] Function functionality tests

**Integration Tests**:
- [ ] Migration rollback tests
- [ ] Seed data insertion tests
- [ ] Foreign key relationship tests

**Manual Testing Steps**:
1. Run migrations and verify table creation
2. Test data insertion and constraints
3. Verify indexes are working properly
4. Test foreign key relationships
5. Validate trigger functions

### Code Quality Standards

**Code Requirements**:
- [ ] Follow PostgreSQL best practices
- [ ] Use consistent naming conventions
- [ ] Implement proper data validation
- [ ] Add comprehensive comments
- [ ] Ensure data integrity

**Security Requirements**:
- [ ] Proper data type validation
- [ ] Constraint-based security
- [ ] Function security definitions

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All tables created with proper structure
- [ ] Indexes created for performance optimization
- [ ] Triggers and functions implemented
- [ ] Seed data inserted and validated
- [ ] Migration files tested and working
- [ ] Schema documentation updated

### Potential Challenges
**Known Risks**:
- Data type compatibility issues - Mitigation: Test with real data samples
- Performance issues with large datasets - Mitigation: Implement proper indexing strategy
- Migration rollback complexity - Mitigation: Test rollback procedures

**Research Required**:
- PostgreSQL performance optimization techniques
- Best practices for mountain climbing data modeling

### Additional Resources
**Reference Materials**:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/designing-schema)

**Related Code**:
- Supabase configuration from ST-MT-2-1
- Authentication schema patterns
- Performance optimization patterns 