## Sub-Task MT-2.1: Supabase Project Setup and Configuration

### Objective
Set up and configure the Supabase project with proper environment configuration, CLI setup, and initial project structure for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This is the foundational setup required before implementing the database schema and authentication system.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Low
**Developer Type**: Backend/DevOps

### Dependencies
**Prerequisites**: 
- [ ] Task 1 completed (Project Setup and Development Environment)
- [ ] Supabase CLI installed locally
- [ ] Supabase account created
- [ ] Environment variables configuration ready

**Outputs Needed By**:
- ST-MT-2-2 (Database Schema Design and Core Tables)
- ST-MT-2-3 (User Profile and Authentication Tables)

### Acceptance Criteria
- [ ] Supabase project created in cloud environment
- [ ] Supabase CLI configured and authenticated
- [ ] Environment variables configured for all environments (dev, staging, prod)
- [ ] Project structure initialized with proper configuration files
- [ ] Database connection established and tested
- [ ] Basic project settings configured (region, plan, etc.)
- [ ] Development team can access and connect to the project

### Technical Implementation

**Architecture Context**:
This sub-task establishes the infrastructure layer of the hexagonal architecture, providing the foundation for all data operations and authentication.

**Files to Create/Modify**:
```
project-root/
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/
├── .env.example
├── .env.local
├── .env.staging
├── .env.production
└── supabase-setup.md
```

**Step-by-Step Implementation**:

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Create new project
   supabase projects create hikers-app --org-id YOUR_ORG_ID
   ```

2. **Initialize Local Configuration**
   ```bash
   # Initialize Supabase in project
   supabase init
   
   # Link to remote project
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Configure Environment Variables**
   Create `.env.example`:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   APPLE_CLIENT_ID=your_apple_client_id
   APPLE_CLIENT_SECRET=your_apple_client_secret
   
   # Storage Configuration
   SUPABASE_STORAGE_BUCKET=hikers-app-content
   ```

4. **Configure Supabase Settings**
   Update `supabase/config.toml`:
   ```toml
   [api]
   enabled = true
   port = 54321
   schemas = ["public", "storage", "graphql_public"]
   extra_search_path = ["public", "extensions"]
   max_rows = 1000
   
   [db]
   port = 54322
   shadow_port = 54320
   major_version = 15
   
   [studio]
   enabled = true
   port = 54323
   
   [inbucket]
   enabled = true
   port = 54324
   
   [storage]
   enabled = true
   
   [auth]
   enabled = true
   port = 54325
   site_url = "http://localhost:3000"
   additional_redirect_urls = ["https://localhost:3000"]
   jwt_expiry = 3600
   refresh_token_rotation_enabled = true
   ```

5. **Test Database Connection**
   ```bash
   # Start local development
   supabase start
   
   # Test connection
   supabase db ping
   ```

6. **Create Initial Migration**
   ```sql
   -- Create initial migration file
   -- supabase/migrations/20240115000000_initial_setup.sql
   
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

**Key Implementation Details**:
- **Design Patterns**: Infrastructure setup pattern
- **Error Handling**: Connection error handling, configuration validation
- **Data Validation**: Environment variable validation
- **Performance Considerations**: Optimize database connection pooling

### Testing Requirements

**Unit Tests**:
- [ ] Environment variable validation tests
- [ ] Supabase connection tests
- [ ] Configuration file validation tests

**Integration Tests**:
- [ ] Database connection integration test
- [ ] Supabase CLI functionality test

**Manual Testing Steps**:
1. Verify Supabase project creation in cloud console
2. Test local development environment startup
3. Validate environment variable configuration
4. Test database connection from local environment
5. Verify team access to project

### Code Quality Standards

**Code Requirements**:
- [ ] Follow established coding conventions and style guide
- [ ] Add comprehensive documentation for setup process
- [ ] Implement proper error handling for connection failures
- [ ] Add logging for debugging and monitoring
- [ ] Ensure secure configuration management

**Security Requirements**:
- [ ] Secure environment variable management
- [ ] Proper access control configuration
- [ ] Secure database connection settings

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All configuration files created and validated
- [ ] Environment variables properly configured
- [ ] Database connection tested and working
- [ ] Documentation updated with setup instructions
- [ ] Team can successfully connect to the project
- [ ] Local development environment functional

### Potential Challenges
**Known Risks**:
- Supabase CLI version compatibility issues - Mitigation: Use specific version requirements
- Environment variable conflicts - Mitigation: Use unique naming conventions
- Network connectivity issues - Mitigation: Implement retry logic

**Research Required**:
- Latest Supabase CLI features and best practices
- Environment-specific configuration strategies

### Additional Resources
**Reference Materials**:
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Supabase Project Setup Guide](https://supabase.com/docs/guides/getting-started)
- [Environment Configuration Best Practices](https://supabase.com/docs/guides/config)

**Related Code**:
- Task 1 project structure and configuration
- Existing environment variable patterns
- Database connection patterns 