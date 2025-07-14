## Sub-Task MT-3.1: Supabase Auth Configuration and Setup

### Objective
Configure and set up Supabase Auth with proper settings, JWT configuration, and authentication flow setup for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 3 - Authentication System Implementation](../main-tasks-mountain-climber-training-app.md#task-3-authentication-system-implementation)
**Context**: This establishes the foundational authentication infrastructure that OAuth providers and user management will build upon.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: Medium
**Developer Type**: Backend

### Dependencies
**Prerequisites**: 
- [ ] Task 1 completed (Project Setup and Development Environment)
- [ ] Task 2 completed (Supabase Backend Setup and Database Schema)
- [ ] Supabase project configured and accessible

**Outputs Needed By**:
- ST-MT-3-2 (OAuth Provider Integration - Google)
- ST-MT-3-3 (OAuth Provider Integration - Apple)
- ST-MT-3-4 (Authentication State Management)

### Acceptance Criteria
- [ ] Supabase Auth enabled and configured
- [ ] JWT settings configured with proper expiration times
- [ ] Authentication flow settings configured
- [ ] Email templates configured for notifications
- [ ] Password policy configured
- [ ] Session management settings configured
- [ ] Auth hooks and utilities created
- [ ] Authentication configuration tested

### Technical Implementation

**Architecture Context**:
This sub-task implements the infrastructure layer of the hexagonal architecture for authentication, providing the foundation for all auth-related operations.

**Files to Create/Modify**:
```
src/
├── lib/
│   ├── supabase/
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   └── types.ts
├── hooks/
│   └── useAuth.ts
├── utils/
│   └── auth.ts
└── config/
    └── auth.ts
```

**Step-by-Step Implementation**:

1. **Configure Supabase Auth Settings**
   ```sql
   -- Configure auth settings in Supabase dashboard or via SQL
   
   -- Set JWT expiration times
   UPDATE auth.config SET 
       jwt_expiry = 3600, -- 1 hour
       refresh_token_rotation_enabled = true,
       refresh_token_reuse_interval = 10; -- 10 seconds
   
   -- Configure password policy
   UPDATE auth.config SET 
       password_min_length = 8,
       password_require_uppercase = true,
       password_require_lowercase = true,
       password_require_numbers = true,
       password_require_special_chars = false;
   ```

2. **Create Supabase Client Configuration**
   ```typescript
   // src/lib/supabase/client.ts
   import { createClient } from '@supabase/supabase-js';
   import { Database } from './types';
   
   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
   
   export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
     auth: {
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: false,
       flowType: 'pkce',
     },
     realtime: {
       params: {
         eventsPerSecond: 10,
       },
     },
   });
   ```

3. **Create Authentication Types**
   ```typescript
   // src/lib/supabase/types.ts
   export interface Database {
     public: {
       Tables: {
         user_profiles: {
           Row: {
             id: string;
             username: string | null;
             first_name: string | null;
             last_name: string | null;
             email: string;
             date_of_birth: string | null;
             gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
             height_cm: number | null;
             weight_kg: number | null;
             fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
             climbing_experience_years: number;
             emergency_contact_name: string | null;
             emergency_contact_phone: string | null;
             emergency_contact_relationship: string | null;
             profile_image_url: string | null;
             is_profile_complete: boolean;
             created_at: string;
             updated_at: string;
           };
           Insert: {
             id: string;
             username?: string | null;
             first_name?: string | null;
             last_name?: string | null;
             email: string;
             date_of_birth?: string | null;
             gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
             height_cm?: number | null;
             weight_kg?: number | null;
             fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
             climbing_experience_years?: number;
             emergency_contact_name?: string | null;
             emergency_contact_phone?: string | null;
             emergency_contact_relationship?: string | null;
             profile_image_url?: string | null;
             is_profile_complete?: boolean;
           };
           Update: {
             username?: string | null;
             first_name?: string | null;
             last_name?: string | null;
             email?: string;
             date_of_birth?: string | null;
             gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
             height_cm?: number | null;
             weight_kg?: number | null;
             fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
             climbing_experience_years?: number;
             emergency_contact_name?: string | null;
             emergency_contact_phone?: string | null;
             emergency_contact_relationship?: string | null;
             profile_image_url?: string | null;
             is_profile_complete?: boolean;
           };
         };
       };
     };
   }
   
   export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
   export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
   export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
   ```

4. **Create Authentication Utilities**
   ```typescript
   // src/lib/supabase/auth.ts
   import { supabase } from './client';
   import { UserProfile, UserProfileInsert } from './types';
   
   export class AuthService {
     // Get current user
     static async getCurrentUser() {
       const { data: { user }, error } = await supabase.auth.getUser();
       if (error) throw error;
       return user;
     }
   
     // Get user profile
     static async getUserProfile(userId: string): Promise<UserProfile | null> {
       const { data, error } = await supabase
         .from('user_profiles')
         .select('*')
         .eq('id', userId)
         .single();
       
       if (error) throw error;
       return data;
     }
   
     // Create user profile
     static async createUserProfile(profile: UserProfileInsert): Promise<UserProfile> {
       const { data, error } = await supabase
         .from('user_profiles')
         .insert(profile)
         .select()
         .single();
       
       if (error) throw error;
       return data;
     }
   
     // Update user profile
     static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
       const { data, error } = await supabase
         .from('user_profiles')
         .update(updates)
         .eq('id', userId)
         .select()
         .single();
       
       if (error) throw error;
       return data;
     }
   
     // Sign out
     static async signOut() {
       const { error } = await supabase.auth.signOut();
       if (error) throw error;
     }
   
     // Get session
     static async getSession() {
       const { data: { session }, error } = await supabase.auth.getSession();
       if (error) throw error;
       return session;
     }
   
     // Refresh session
     static async refreshSession() {
       const { data: { session }, error } = await supabase.auth.refreshSession();
       if (error) throw error;
       return session;
     }
   }
   ```

5. **Create Authentication Hook**
   ```typescript
   // src/hooks/useAuth.ts
   import { useEffect, useState } from 'react';
   import { User, Session } from '@supabase/supabase-js';
   import { supabase } from '../lib/supabase/client';
   import { AuthService } from '../lib/supabase/auth';
   import { UserProfile } from '../lib/supabase/types';
   
   interface AuthState {
     user: User | null;
     session: Session | null;
     profile: UserProfile | null;
     loading: boolean;
     error: string | null;
   }
   
   export function useAuth() {
     const [authState, setAuthState] = useState<AuthState>({
       user: null,
       session: null,
       profile: null,
       loading: true,
       error: null,
     });
   
     useEffect(() => {
       // Get initial session
       const getInitialSession = async () => {
         try {
           const session = await AuthService.getSession();
           if (session?.user) {
             const profile = await AuthService.getUserProfile(session.user.id);
             setAuthState({
               user: session.user,
               session,
               profile,
               loading: false,
               error: null,
             });
           } else {
             setAuthState(prev => ({ ...prev, loading: false }));
           }
         } catch (error) {
           setAuthState({
             user: null,
             session: null,
             profile: null,
             loading: false,
             error: error instanceof Error ? error.message : 'Authentication error',
           });
         }
       };
   
       getInitialSession();
   
       // Listen for auth changes
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         async (event, session) => {
           try {
             if (session?.user) {
               const profile = await AuthService.getUserProfile(session.user.id);
               setAuthState({
                 user: session.user,
                 session,
                 profile,
                 loading: false,
                 error: null,
               });
             } else {
               setAuthState({
                 user: null,
                 session: null,
                 profile: null,
                 loading: false,
                 error: null,
               });
             }
           } catch (error) {
             setAuthState({
               user: null,
               session: null,
               profile: null,
               loading: false,
               error: error instanceof Error ? error.message : 'Authentication error',
             });
           }
         }
       );
   
       return () => subscription.unsubscribe();
     }, []);
   
     const signOut = async () => {
       try {
         await AuthService.signOut();
       } catch (error) {
         setAuthState(prev => ({
           ...prev,
           error: error instanceof Error ? error.message : 'Sign out error',
         }));
       }
     };
   
     const refreshProfile = async () => {
       if (authState.user) {
         try {
           const profile = await AuthService.getUserProfile(authState.user.id);
           setAuthState(prev => ({ ...prev, profile }));
         } catch (error) {
           setAuthState(prev => ({
             ...prev,
             error: error instanceof Error ? error.message : 'Profile refresh error',
           }));
         }
       }
     };
   
     return {
       ...authState,
       signOut,
       refreshProfile,
     };
   }
   ```

6. **Create Authentication Configuration**
   ```typescript
   // src/config/auth.ts
   export const AUTH_CONFIG = {
     // JWT settings
     jwt: {
       expiry: 3600, // 1 hour
       refreshTokenRotation: true,
       refreshTokenReuseInterval: 10, // 10 seconds
     },
   
     // Password policy
     password: {
       minLength: 8,
       requireUppercase: true,
       requireLowercase: true,
       requireNumbers: true,
       requireSpecialChars: false,
     },
   
     // Session settings
     session: {
       autoRefresh: true,
       persistSession: true,
       detectSessionInUrl: false,
     },
   
     // OAuth settings
     oauth: {
       google: {
         clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
         redirectUrl: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URL!,
       },
       apple: {
         clientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID!,
         redirectUrl: process.env.EXPO_PUBLIC_APPLE_REDIRECT_URL!,
       },
     },
   
     // Email templates
     email: {
       confirmSignup: {
         subject: 'Confirm your Hikers App account',
         template: 'confirm-signup',
       },
       resetPassword: {
         subject: 'Reset your Hikers App password',
         template: 'reset-password',
       },
     },
   } as const;
   ```

**Key Implementation Details**:
- **Design Patterns**: Service pattern, hook pattern, configuration pattern
- **Error Handling**: Comprehensive error handling for auth operations
- **Data Validation**: Type-safe authentication operations
- **Performance Considerations**: Efficient session management, minimal re-renders

### Testing Requirements

**Unit Tests**:
- [ ] AuthService method tests
- [ ] useAuth hook tests
- [ ] Configuration validation tests
- [ ] Error handling tests

**Integration Tests**:
- [ ] Supabase client integration tests
- [ ] Session management tests
- [ ] Profile management tests

**Manual Testing Steps**:
1. Test Supabase client connection
2. Verify authentication configuration
3. Test session management
4. Validate profile operations
5. Test error handling scenarios

### Code Quality Standards

**Code Requirements**:
- [ ] Follow TypeScript best practices
- [ ] Use consistent error handling
- [ ] Implement proper type safety
- [ ] Add comprehensive documentation
- [ ] Ensure code reusability

**Security Requirements**:
- [ ] Secure session management
- [ ] Proper error handling without information leakage
- [ ] Type-safe authentication operations

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All authentication utilities created and tested
- [ ] Configuration properly set up
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Integration tests passing

### Potential Challenges
**Known Risks**:
- Type generation complexity - Mitigation: Use Supabase CLI for type generation
- Session persistence issues - Mitigation: Test across app restarts
- Error handling complexity - Mitigation: Comprehensive error scenarios

**Research Required**:
- Latest Supabase Auth features
- React Native authentication best practices

### Additional Resources
**Reference Materials**:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Native Auth Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/react-native)
- [TypeScript Auth Patterns](https://supabase.com/docs/guides/auth/auth-helpers/typescript)

**Related Code**:
- Supabase configuration from Task 2
- Database schema patterns
- State management patterns 