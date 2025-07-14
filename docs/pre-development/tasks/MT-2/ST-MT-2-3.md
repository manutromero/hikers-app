## Sub-Task MT-2.3: User Profile and Authentication Tables

### Objective
Create and implement authentication-related database tables, user session management, and profile extension tables that integrate with Supabase Auth system.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This extends the core user_profiles table with authentication-specific functionality and session management.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: Medium
**Developer Type**: Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-1 (Supabase Project Setup and Configuration)
- [ ] ST-MT-2-2 (Database Schema Design and Core Tables)
- [ ] Supabase Auth enabled and configured

**Outputs Needed By**:
- ST-MT-2-7 (Row Level Security (RLS) Policies Implementation)
- ST-MT-2-4 (Wearable Data and Device Integration Tables)

### Acceptance Criteria
- [ ] Authentication sessions table created
- [ ] User roles and permissions table created
- [ ] Profile extension tables implemented
- [ ] Auth triggers and functions created
- [ ] Session management functions implemented
- [ ] User role management functions created
- [ ] Database migration files created and tested
- [ ] Integration with Supabase Auth verified

### Technical Implementation

**Architecture Context**:
This sub-task implements the domain layer of the hexagonal architecture, extending the authentication domain with session management and role-based access control.

**Files to Create/Modify**:
```
supabase/
├── migrations/
│   └── 20240115000003_auth_tables.sql
├── functions/
│   ├── auth_functions.sql
│   └── session_functions.sql
└── triggers/
    └── auth_triggers.sql
```

**Step-by-Step Implementation**:

1. **Create Authentication Sessions Table**
   ```sql
   -- supabase/migrations/20240115000003_auth_tables.sql
   
   -- User sessions table for tracking active sessions
   CREATE TABLE user_sessions (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       session_token VARCHAR(255) UNIQUE NOT NULL,
       device_info JSONB,
       ip_address INET,
       user_agent TEXT,
       is_active BOOLEAN DEFAULT true,
       expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- User roles table for role-based access control
   CREATE TABLE user_roles (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       role_name VARCHAR(50) NOT NULL CHECK (role_name IN ('user', 'premium_user', 'admin', 'moderator')),
       granted_by UUID REFERENCES auth.users(id),
       granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       expires_at TIMESTAMP WITH TIME ZONE,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id, role_name)
   );
   
   -- User permissions table for granular permissions
   CREATE TABLE user_permissions (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       role_name VARCHAR(50) NOT NULL,
       permission_name VARCHAR(100) NOT NULL,
       resource VARCHAR(100) NOT NULL,
       action VARCHAR(50) NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(role_name, permission_name, resource, action)
   );
   
   -- User login history table
   CREATE TABLE user_login_history (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       login_method VARCHAR(50) NOT NULL CHECK (login_method IN ('email', 'google', 'apple')),
       ip_address INET,
       user_agent TEXT,
       device_info JSONB,
       success BOOLEAN NOT NULL,
       failure_reason TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Create Indexes for Performance**
   ```sql
   -- User sessions indexes
   CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
   CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
   CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
   CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
   
   -- User roles indexes
   CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
   CREATE INDEX idx_user_roles_role_name ON user_roles(role_name);
   CREATE INDEX idx_user_roles_active ON user_roles(is_active);
   
   -- User permissions indexes
   CREATE INDEX idx_user_permissions_role ON user_permissions(role_name);
   CREATE INDEX idx_user_permissions_resource ON user_permissions(resource);
   
   -- User login history indexes
   CREATE INDEX idx_user_login_history_user_id ON user_login_history(user_id);
   CREATE INDEX idx_user_login_history_created_at ON user_login_history(created_at);
   CREATE INDEX idx_user_login_history_method ON user_login_history(login_method);
   ```

3. **Create Authentication Functions**
   ```sql
   -- supabase/functions/auth_functions.sql
   
   -- Function to get user roles
   CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID)
   RETURNS TABLE (
       role_name VARCHAR(50),
       granted_at TIMESTAMP WITH TIME ZONE,
       expires_at TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           ur.role_name,
           ur.granted_at,
           ur.expires_at
       FROM user_roles ur
       WHERE ur.user_id = get_user_roles.user_id 
           AND ur.is_active = true
           AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to check if user has role
   CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name VARCHAR(50))
   RETURNS BOOLEAN AS $$
   BEGIN
       RETURN EXISTS (
           SELECT 1 FROM user_roles ur
           WHERE ur.user_id = has_role.user_id 
               AND ur.role_name = has_role.role_name
               AND ur.is_active = true
               AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
       );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to check if user has permission
   CREATE OR REPLACE FUNCTION has_permission(user_id UUID, resource VARCHAR(100), action VARCHAR(50))
   RETURNS BOOLEAN AS $$
   BEGIN
       RETURN EXISTS (
           SELECT 1 FROM user_roles ur
           JOIN user_permissions up ON ur.role_name = up.role_name
           WHERE ur.user_id = has_permission.user_id 
               AND up.resource = has_permission.resource
               AND up.action = has_permission.action
               AND ur.is_active = true
               AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
       );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to create user session
   CREATE OR REPLACE FUNCTION create_user_session(
       p_user_id UUID,
       p_session_token VARCHAR(255),
       p_device_info JSONB DEFAULT NULL,
       p_ip_address INET DEFAULT NULL,
       p_user_agent TEXT DEFAULT NULL,
       p_expires_in_hours INTEGER DEFAULT 24
   )
   RETURNS UUID AS $$
   DECLARE
       session_id UUID;
   BEGIN
       INSERT INTO user_sessions (
           user_id, 
           session_token, 
           device_info, 
           ip_address, 
           user_agent, 
           expires_at
       ) VALUES (
           p_user_id,
           p_session_token,
           p_device_info,
           p_ip_address,
           p_user_agent,
           NOW() + (p_expires_in_hours || ' hours')::INTERVAL
       ) RETURNING id INTO session_id;
       
       RETURN session_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Create Session Management Functions**
   ```sql
   -- supabase/functions/session_functions.sql
   
   -- Function to invalidate user session
   CREATE OR REPLACE FUNCTION invalidate_session(session_token VARCHAR(255))
   RETURNS BOOLEAN AS $$
   BEGIN
       UPDATE user_sessions 
       SET is_active = false, updated_at = NOW()
       WHERE session_token = invalidate_session.session_token;
       
       RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to invalidate all user sessions
   CREATE OR REPLACE FUNCTION invalidate_all_user_sessions(user_id UUID)
   RETURNS INTEGER AS $$
   DECLARE
       affected_rows INTEGER;
   BEGIN
       UPDATE user_sessions 
       SET is_active = false, updated_at = NOW()
       WHERE user_id = invalidate_all_user_sessions.user_id AND is_active = true;
       
       GET DIAGNOSTICS affected_rows = ROW_COUNT;
       RETURN affected_rows;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to clean expired sessions
   CREATE OR REPLACE FUNCTION clean_expired_sessions()
   RETURNS INTEGER AS $$
   DECLARE
       affected_rows INTEGER;
   BEGIN
       UPDATE user_sessions 
       SET is_active = false, updated_at = NOW()
       WHERE expires_at < NOW() AND is_active = true;
       
       GET DIAGNOSTICS affected_rows = ROW_COUNT;
       RETURN affected_rows;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get active sessions for user
   CREATE OR REPLACE FUNCTION get_user_active_sessions(user_id UUID)
   RETURNS TABLE (
       session_id UUID,
       session_token VARCHAR(255),
       device_info JSONB,
       ip_address INET,
       created_at TIMESTAMP WITH TIME ZONE,
       expires_at TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           us.id,
           us.session_token,
           us.device_info,
           us.ip_address,
           us.created_at,
           us.expires_at
       FROM user_sessions us
       WHERE us.user_id = get_user_active_sessions.user_id 
           AND us.is_active = true
           AND us.expires_at > NOW();
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Create Authentication Triggers**
   ```sql
   -- supabase/triggers/auth_triggers.sql
   
   -- Trigger to log login attempts
   CREATE OR REPLACE FUNCTION log_login_attempt()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO user_login_history (
           user_id,
           login_method,
           ip_address,
           user_agent,
           device_info,
           success,
           failure_reason
       ) VALUES (
           NEW.id,
           COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
           inet_client_addr(),
           current_setting('request.headers')::json->>'user-agent',
           NEW.raw_app_meta_data->>'device_info',
           true,
           NULL
       );
       
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   -- Create trigger on auth.users insert
   CREATE TRIGGER auth_users_login_log
       AFTER INSERT ON auth.users
       FOR EACH ROW EXECUTE FUNCTION log_login_attempt();
   
   -- Trigger to create default user role
   CREATE OR REPLACE FUNCTION create_default_user_role()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO user_roles (user_id, role_name)
       VALUES (NEW.id, 'user');
       
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   -- Create trigger on user_profiles insert
   CREATE TRIGGER create_default_role
       AFTER INSERT ON user_profiles
       FOR EACH ROW EXECUTE FUNCTION create_default_user_role();
   ```

6. **Insert Default Permissions**
   ```sql
   -- Insert default permissions for roles
   INSERT INTO user_permissions (role_name, permission_name, resource, action) VALUES
   -- User permissions
   ('user', 'read', 'own_profile', 'profile'),
   ('user', 'update', 'own_profile', 'profile'),
   ('user', 'read', 'own_training', 'training'),
   ('user', 'create', 'own_training', 'training'),
   ('user', 'update', 'own_training', 'training'),
   ('user', 'read', 'own_wearable_data', 'wearable'),
   ('user', 'create', 'own_wearable_data', 'wearable'),
   
   -- Premium user permissions (extends user)
   ('premium_user', 'read', 'advanced_analytics', 'analytics'),
   ('premium_user', 'read', 'premium_content', 'content'),
   ('premium_user', 'create', 'custom_training', 'training'),
   
   -- Moderator permissions
   ('moderator', 'read', 'all_profiles', 'profile'),
   ('moderator', 'update', 'user_roles', 'admin'),
   ('moderator', 'read', 'system_logs', 'admin'),
   
   -- Admin permissions
   ('admin', 'all', 'all', 'all');
   ```

7. **Create Updated At Triggers**
   ```sql
   -- Create triggers for updated_at columns
   CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

**Key Implementation Details**:
- **Design Patterns**: Role-based access control pattern, session management pattern
- **Error Handling**: Comprehensive error handling for auth operations
- **Data Validation**: Proper constraints and validation rules
- **Performance Considerations**: Strategic indexing, efficient queries

### Testing Requirements

**Unit Tests**:
- [ ] Authentication function tests
- [ ] Session management tests
- [ ] Role and permission tests
- [ ] Trigger functionality tests

**Integration Tests**:
- [ ] Supabase Auth integration tests
- [ ] Session lifecycle tests
- [ ] Role assignment tests

**Manual Testing Steps**:
1. Test user session creation and management
2. Verify role assignment and permissions
3. Test session expiration and cleanup
4. Validate login history logging
5. Test trigger functionality

### Code Quality Standards

**Code Requirements**:
- [ ] Follow PostgreSQL best practices
- [ ] Use consistent naming conventions
- [ ] Implement proper data validation
- [ ] Add comprehensive comments
- [ ] Ensure data integrity

**Security Requirements**:
- [ ] Secure session management
- [ ] Role-based access control
- [ ] Session token security
- [ ] Audit trail implementation

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All authentication tables created and tested
- [ ] Functions and triggers implemented
- [ ] Default permissions inserted
- [ ] Integration with Supabase Auth verified
- [ ] Performance testing completed
- [ ] Security validation passed

### Potential Challenges
**Known Risks**:
- Session token security - Mitigation: Use secure token generation
- Performance with large session tables - Mitigation: Implement cleanup procedures
- Role hierarchy complexity - Mitigation: Keep role structure simple

**Research Required**:
- Supabase Auth integration best practices
- Session management security patterns

### Additional Resources
**Reference Materials**:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)
- [Session Management Patterns](https://supabase.com/docs/guides/auth/sessions)

**Related Code**:
- Core database schema from ST-MT-2-2
- Supabase configuration from ST-MT-2-1
- RLS policies from ST-MT-2-7 