## Sub-Task MT-2.9: OAuth Providers Configuration

### Objective
Configure and set up OAuth providers (Google and Apple) in Supabase with proper authentication flow, callback handling, and security settings for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This implements the OAuth authentication layer that enables secure social login for users through Google and Apple services.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: Medium
**Developer Type**: Backend/Security

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-7 (Row Level Security (RLS) Policies Implementation)
- [ ] Supabase Auth configured and working
- [ ] OAuth application credentials obtained

**Outputs Needed By**:
- ST-MT-2-10 (Storage Buckets and Real-time Setup)
- Task 3 (Authentication System Implementation)

### Acceptance Criteria
- [ ] Google OAuth provider configured
- [ ] Apple Sign-In provider configured
- [ ] OAuth callback URLs configured
- [ ] Security settings implemented
- [ ] User profile mapping configured
- [ ] OAuth flow testing completed
- [ ] Error handling implemented
- [ ] Documentation updated

### Technical Implementation

**Architecture Context**:
This sub-task implements the infrastructure layer of the hexagonal architecture for OAuth authentication, providing secure social login capabilities.

**Files to Create/Modify**:
```
supabase/
├── migrations/
│   └── 20240115000009_oauth_config.sql
├── functions/
│   └── oauth_functions.sql
├── config/
│   ├── google_oauth.sql
│   └── apple_oauth.sql
└── security/
    └── oauth_security.sql
```

**Step-by-Step Implementation**:

1. **Configure Google OAuth Provider**
   ```sql
   -- supabase/config/google_oauth.sql
   
   -- Enable Google OAuth provider
   INSERT INTO auth.providers (id, name, created_at, updated_at)
   VALUES ('google', 'google', NOW(), NOW())
   ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
   
   -- Configure Google OAuth settings
   INSERT INTO auth.config (id, value, created_at, updated_at)
   VALUES 
   ('google.client_id', 'your_google_client_id', NOW(), NOW()),
   ('google.client_secret', 'your_google_client_secret', NOW(), NOW()),
   ('google.redirect_uri', 'https://your-project.supabase.co/auth/v1/callback', NOW(), NOW()),
   ('google.scope', 'openid email profile', NOW(), NOW()),
   ('google.response_type', 'code', NOW(), NOW()),
   ('google.access_type', 'offline', NOW(), NOW()),
   ('google.prompt', 'consent', NOW(), NOW())
   ON CONFLICT (id) DO UPDATE SET 
       value = EXCLUDED.value,
       updated_at = NOW();
   ```

2. **Configure Apple Sign-In Provider**
   ```sql
   -- supabase/config/apple_oauth.sql
   
   -- Enable Apple OAuth provider
   INSERT INTO auth.providers (id, name, created_at, updated_at)
   VALUES ('apple', 'apple', NOW(), NOW())
   ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
   
   -- Configure Apple Sign-In settings
   INSERT INTO auth.config (id, value, created_at, updated_at)
   VALUES 
   ('apple.client_id', 'your_apple_client_id', NOW(), NOW()),
   ('apple.client_secret', 'your_apple_client_secret', NOW(), NOW()),
   ('apple.redirect_uri', 'https://your-project.supabase.co/auth/v1/callback', NOW(), NOW()),
   ('apple.scope', 'name email', NOW(), NOW()),
   ('apple.response_type', 'code', NOW(), NOW()),
   ('apple.response_mode', 'form_post', NOW(), NOW())
   ON CONFLICT (id) DO UPDATE SET 
       value = EXCLUDED.value,
       updated_at = NOW();
   ```

3. **Create OAuth Configuration Migration**
   ```sql
   -- supabase/migrations/20240115000009_oauth_config.sql
   
   -- OAuth provider settings table
   CREATE TABLE oauth_provider_settings (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       provider_name VARCHAR(50) NOT NULL UNIQUE,
       client_id VARCHAR(255) NOT NULL,
       client_secret TEXT NOT NULL,
       redirect_uri TEXT NOT NULL,
       scope TEXT,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- OAuth user mappings table
   CREATE TABLE oauth_user_mappings (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       provider_name VARCHAR(50) NOT NULL,
       provider_user_id VARCHAR(255) NOT NULL,
       provider_email VARCHAR(255),
       provider_profile JSONB,
       access_token TEXT,
       refresh_token TEXT,
       token_expires_at TIMESTAMP WITH TIME ZONE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id, provider_name),
       UNIQUE(provider_name, provider_user_id)
   );
   
   -- OAuth callback logs table
   CREATE TABLE oauth_callback_logs (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       provider_name VARCHAR(50) NOT NULL,
       callback_data JSONB,
       success BOOLEAN NOT NULL,
       error_message TEXT,
       ip_address INET,
       user_agent TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Create OAuth Management Functions**
   ```sql
   -- supabase/functions/oauth_functions.sql
   
   -- Function to handle OAuth user creation
   CREATE OR REPLACE FUNCTION handle_oauth_user_creation(
       p_provider_name VARCHAR(50),
       p_provider_user_id VARCHAR(255),
       p_provider_email VARCHAR(255),
       p_provider_profile JSONB
   )
   RETURNS UUID AS $$
   DECLARE
       user_id UUID;
       mapping_id UUID;
   BEGIN
       -- Check if user already exists with this OAuth mapping
       SELECT oum.user_id INTO user_id
       FROM oauth_user_mappings oum
       WHERE oum.provider_name = p_provider_name
           AND oum.provider_user_id = p_provider_user_id;
       
       -- If user doesn't exist, create new user
       IF user_id IS NULL THEN
           -- Create new user in auth.users (this would be handled by Supabase Auth)
           -- For now, we'll assume the user is created and we get the ID
           user_id := gen_random_uuid(); -- Placeholder for actual user creation
           
           -- Create user profile
           INSERT INTO user_profiles (
               id,
               email,
               first_name,
               last_name,
               profile_image_url,
               is_profile_complete
           ) VALUES (
               user_id,
               p_provider_email,
               p_provider_profile->>'given_name',
               p_provider_profile->>'family_name',
               p_provider_profile->>'picture',
               false
           );
       END IF;
       
       -- Create or update OAuth mapping
       INSERT INTO oauth_user_mappings (
           user_id,
           provider_name,
           provider_user_id,
           provider_email,
           provider_profile
       ) VALUES (
           user_id,
           p_provider_name,
           p_provider_user_id,
           p_provider_email,
           p_provider_profile
       ) ON CONFLICT (user_id, provider_name) DO UPDATE SET
           provider_profile = EXCLUDED.provider_profile,
           updated_at = NOW()
       RETURNING id INTO mapping_id;
       
       RETURN user_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get OAuth user mapping
   CREATE OR REPLACE FUNCTION get_oauth_user_mapping(
       p_provider_name VARCHAR(50),
       p_provider_user_id VARCHAR(255)
   )
   RETURNS TABLE (
       user_id UUID,
       provider_email VARCHAR(255),
       provider_profile JSONB,
       created_at TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           oum.user_id,
           oum.provider_email,
           oum.provider_profile,
           oum.created_at
       FROM oauth_user_mappings oum
       WHERE oum.provider_name = p_provider_name
           AND oum.provider_user_id = p_provider_user_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to log OAuth callback
   CREATE OR REPLACE FUNCTION log_oauth_callback(
       p_provider_name VARCHAR(50),
       p_callback_data JSONB,
       p_success BOOLEAN,
       p_error_message TEXT DEFAULT NULL
   )
   RETURNS UUID AS $$
   DECLARE
       log_id UUID;
   BEGIN
       INSERT INTO oauth_callback_logs (
           provider_name,
           callback_data,
           success,
           error_message,
           ip_address,
           user_agent
       ) VALUES (
           p_provider_name,
           p_callback_data,
           p_success,
           p_error_message,
           inet_client_addr(),
           current_setting('request.headers')::json->>'user-agent'
       ) RETURNING id INTO log_id;
       
       RETURN log_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Create OAuth Security Functions**
   ```sql
   -- supabase/security/oauth_security.sql
   
   -- Function to validate OAuth provider
   CREATE OR REPLACE FUNCTION validate_oauth_provider(provider_name VARCHAR(50))
   RETURNS BOOLEAN AS $$
   BEGIN
       RETURN EXISTS (
           SELECT 1 FROM oauth_provider_settings
           WHERE provider_name = validate_oauth_provider.provider_name
               AND is_active = true
       );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get OAuth provider settings
   CREATE OR REPLACE FUNCTION get_oauth_provider_settings(provider_name VARCHAR(50))
   RETURNS TABLE (
       client_id VARCHAR(255),
       redirect_uri TEXT,
       scope TEXT
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           ops.client_id,
           ops.redirect_uri,
           ops.scope
       FROM oauth_provider_settings ops
       WHERE ops.provider_name = get_oauth_provider_settings.provider_name
           AND ops.is_active = true;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to update OAuth tokens
   CREATE OR REPLACE FUNCTION update_oauth_tokens(
       p_user_id UUID,
       p_provider_name VARCHAR(50),
       p_access_token TEXT,
       p_refresh_token TEXT,
       p_token_expires_at TIMESTAMP WITH TIME ZONE
   )
   RETURNS BOOLEAN AS $$
   BEGIN
       UPDATE oauth_user_mappings 
       SET 
           access_token = p_access_token,
           refresh_token = p_refresh_token,
           token_expires_at = p_token_expires_at,
           updated_at = NOW()
       WHERE user_id = p_user_id
           AND provider_name = p_provider_name;
       
       RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

6. **Insert Default OAuth Settings**
   ```sql
   -- Insert default OAuth provider settings
   INSERT INTO oauth_provider_settings (provider_name, client_id, client_secret, redirect_uri, scope) VALUES
   ('google', 
    'your_google_client_id_here', 
    'your_google_client_secret_here',
    'https://your-project.supabase.co/auth/v1/callback',
    'openid email profile'),
   
   ('apple', 
    'your_apple_client_id_here', 
    'your_apple_client_secret_here',
    'https://your-project.supabase.co/auth/v1/callback',
    'name email');
   ```

7. **Create Updated At Triggers**
   ```sql
   -- Create triggers for updated_at columns
   CREATE TRIGGER update_oauth_provider_settings_updated_at BEFORE UPDATE ON oauth_provider_settings
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_oauth_user_mappings_updated_at BEFORE UPDATE ON oauth_user_mappings
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

8. **Create OAuth Indexes**
   ```sql
   -- OAuth provider settings indexes
   CREATE INDEX idx_oauth_provider_settings_name ON oauth_provider_settings(provider_name);
   CREATE INDEX idx_oauth_provider_settings_active ON oauth_provider_settings(is_active);
   
   -- OAuth user mappings indexes
   CREATE INDEX idx_oauth_user_mappings_user ON oauth_user_mappings(user_id);
   CREATE INDEX idx_oauth_user_mappings_provider ON oauth_user_mappings(provider_name, provider_user_id);
   CREATE INDEX idx_oauth_user_mappings_email ON oauth_user_mappings(provider_email);
   
   -- OAuth callback logs indexes
   CREATE INDEX idx_oauth_callback_logs_provider ON oauth_callback_logs(provider_name);
   CREATE INDEX idx_oauth_callback_logs_success ON oauth_callback_logs(success);
   CREATE INDEX idx_oauth_callback_logs_created_at ON oauth_callback_logs(created_at);
   ```

**Key Implementation Details**:
- **Design Patterns**: OAuth pattern, security pattern, callback pattern
- **Error Handling**: Comprehensive OAuth error handling and logging
- **Data Validation**: OAuth provider validation and security checks
- **Performance Considerations**: Efficient OAuth mapping and token management

### Testing Requirements

**Unit Tests**:
- [ ] OAuth provider configuration tests
- [ ] User mapping function tests
- [ ] Security validation tests
- [ ] Callback logging tests

**Integration Tests**:
- [ ] Google OAuth flow testing
- [ ] Apple Sign-In flow testing
- [ ] OAuth callback handling tests

**Manual Testing Steps**:
1. Test Google OAuth configuration
2. Test Apple Sign-In configuration
3. Verify OAuth callback handling
4. Test user profile mapping
5. Validate security settings

### Code Quality Standards

**Code Requirements**:
- [ ] Follow OAuth security best practices
- [ ] Use secure token handling
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure data privacy

**Security Requirements**:
- [ ] Secure OAuth configuration
- [ ] Token encryption and storage
- [ ] Callback URL validation
- [ ] User data protection

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All OAuth providers configured and tested
- [ ] Security functions implemented
- [ ] Callback handling working
- [ ] User mapping functional
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- OAuth provider changes - Mitigation: Use environment variables for configuration
- Token security - Mitigation: Implement secure token storage
- Callback URL management - Mitigation: Use proper URL validation

**Research Required**:
- Latest OAuth provider requirements
- OAuth security best practices
- Token management strategies

### Additional Resources
**Reference Materials**:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Supabase Auth OAuth Guide](https://supabase.com/docs/guides/auth/social-login)

**Related Code**:
- Authentication system from Task 3
- RLS policies from ST-MT-2-7
- User profiles from ST-MT-2-3 