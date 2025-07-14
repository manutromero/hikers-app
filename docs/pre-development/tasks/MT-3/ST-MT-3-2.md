## Sub-Task MT-3.2: OAuth Provider Integration (Google)

### Objective
Implement Google OAuth integration with proper authentication flow, token handling, and user profile mapping for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 3 - Authentication System Implementation](../main-tasks-mountain-climber-training-app.md#task-3-authentication-system-implementation)
**Context**: This implements the Google OAuth authentication flow, enabling users to sign in with their Google accounts securely.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Frontend/Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-3-1 (Supabase Auth Configuration and Setup)
- [ ] Google OAuth credentials configured in Supabase
- [ ] React Native environment setup

**Outputs Needed By**:
- ST-MT-3-4 (Authentication State Management)
- ST-MT-3-5 (JWT Token Handling and Refresh Logic)

### Acceptance Criteria
- [ ] Google OAuth client configuration implemented
- [ ] Google Sign-In button component created
- [ ] OAuth flow handling implemented
- [ ] User profile mapping from Google data
- [ ] Error handling for OAuth failures
- [ ] Loading states and user feedback
- [ ] OAuth flow testing completed
- [ ] Integration with Supabase Auth verified

### Technical Implementation

**Architecture Context**:
This sub-task implements the application layer of the hexagonal architecture, providing Google OAuth authentication services and UI components.

**Files to Create/Modify**:
```
src/
├── auth/
│   ├── providers/
│   │   ├── GoogleAuthProvider.ts
│   │   └── googleAuthConfig.ts
│   ├── components/
│   │   └── GoogleSignInButton.tsx
│   └── hooks/
│       └── useGoogleAuth.ts
├── types/
│   └── auth.types.ts
└── utils/
    └── authUtils.ts
```

**Step-by-Step Implementation**:

1. **Create Google OAuth Configuration**
   ```typescript
   // src/auth/providers/googleAuthConfig.ts
   
   export interface GoogleAuthConfig {
     clientId: string;
     clientSecret: string;
     redirectUri: string;
     scopes: string[];
   }
   
   export const googleAuthConfig: GoogleAuthConfig = {
     clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
     clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
     redirectUri: process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || '',
     scopes: ['openid', 'email', 'profile']
   };
   
   export const validateGoogleConfig = (): boolean => {
     return !!(googleAuthConfig.clientId && googleAuthConfig.redirectUri);
   };
   ```

2. **Create Google Auth Provider**
   ```typescript
   // src/auth/providers/GoogleAuthProvider.ts
   
   import { supabase } from '@/lib/supabase';
   import { googleAuthConfig } from './googleAuthConfig';
   import { AuthError, AuthResponse } from '@supabase/supabase-js';
   
   export interface GoogleUserProfile {
     id: string;
     email: string;
     firstName?: string;
     lastName?: string;
     profileImage?: string;
     provider: 'google';
   }
   
   export class GoogleAuthProvider {
     private static instance: GoogleAuthProvider;
   
     static getInstance(): GoogleAuthProvider {
       if (!GoogleAuthProvider.instance) {
         GoogleAuthProvider.instance = new GoogleAuthProvider();
       }
       return GoogleAuthProvider.instance;
     }
   
     async signIn(): Promise<AuthResponse> {
       try {
         const { data, error } = await supabase.auth.signInWithOAuth({
           provider: 'google',
           options: {
             redirectTo: googleAuthConfig.redirectUri,
             queryParams: {
               access_type: 'offline',
               prompt: 'consent',
             },
           },
         });
   
         if (error) {
           throw new Error(`Google OAuth error: ${error.message}`);
         }
   
         return data;
       } catch (error) {
         console.error('Google sign-in error:', error);
         throw error;
       }
     }
   
     async signOut(): Promise<void> {
       try {
         const { error } = await supabase.auth.signOut();
         if (error) {
           throw new Error(`Sign out error: ${error.message}`);
         }
       } catch (error) {
         console.error('Google sign-out error:', error);
         throw error;
       }
     }
   
     async getUserProfile(): Promise<GoogleUserProfile | null> {
       try {
         const { data: { user }, error } = await supabase.auth.getUser();
   
         if (error || !user) {
           return null;
         }
   
         const userMetadata = user.user_metadata;
         const providerData = userMetadata?.providers?.google;
   
         return {
           id: user.id,
           email: user.email || '',
           firstName: providerData?.first_name || userMetadata?.full_name?.split(' ')[0],
           lastName: providerData?.last_name || userMetadata?.full_name?.split(' ').slice(1).join(' '),
           profileImage: providerData?.avatar_url || userMetadata?.avatar_url,
           provider: 'google'
         };
       } catch (error) {
         console.error('Get user profile error:', error);
         return null;
       }
     }
   
     async refreshSession(): Promise<AuthResponse> {
       try {
         const { data, error } = await supabase.auth.refreshSession();
   
         if (error) {
           throw new Error(`Session refresh error: ${error.message}`);
         }
   
         return data;
       } catch (error) {
         console.error('Session refresh error:', error);
         throw error;
       }
     }
   }
   ```

3. **Create Google Sign-In Button Component**
   ```typescript
   // src/auth/components/GoogleSignInButton.tsx
   
   import React, { useState } from 'react';
   import {
     TouchableOpacity,
     Text,
     StyleSheet,
     ActivityIndicator,
     View,
   } from 'react-native';
   import { Ionicons } from '@expo/vector-icons';
   import { GoogleAuthProvider } from '../providers/GoogleAuthProvider';
   import { useAuth } from '../hooks/useAuth';
   
   interface GoogleSignInButtonProps {
     onSuccess?: () => void;
     onError?: (error: Error) => void;
     disabled?: boolean;
   }
   
   export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
     onSuccess,
     onError,
     disabled = false,
   }) => {
     const [isLoading, setIsLoading] = useState(false);
     const { setUser } = useAuth();
   
     const handleGoogleSignIn = async () => {
       if (disabled || isLoading) return;
   
       setIsLoading(true);
   
       try {
         const googleProvider = GoogleAuthProvider.getInstance();
         const response = await googleProvider.signIn();
   
         if (response.user) {
           const userProfile = await googleProvider.getUserProfile();
           setUser(userProfile);
           onSuccess?.();
         }
       } catch (error) {
         console.error('Google sign-in failed:', error);
         onError?.(error as Error);
       } finally {
         setIsLoading(false);
       }
     };
   
     return (
       <TouchableOpacity
         style={[
           styles.button,
           disabled && styles.buttonDisabled,
           isLoading && styles.buttonLoading,
         ]}
         onPress={handleGoogleSignIn}
         disabled={disabled || isLoading}
         activeOpacity={0.8}
       >
         {isLoading ? (
           <ActivityIndicator color="#4285F4" size="small" />
         ) : (
           <Ionicons name="logo-google" size={20} color="#4285F4" />
         )}
         <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
           {isLoading ? 'Signing in...' : 'Continue with Google'}
         </Text>
       </TouchableOpacity>
     );
   };
   
   const styles = StyleSheet.create({
     button: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'center',
       backgroundColor: '#FFFFFF',
       borderWidth: 1,
       borderColor: '#E0E0E0',
       borderRadius: 8,
       paddingVertical: 12,
       paddingHorizontal: 16,
       marginVertical: 8,
       shadowColor: '#000',
       shadowOffset: {
         width: 0,
         height: 2,
       },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
     },
     buttonDisabled: {
       opacity: 0.6,
     },
     buttonLoading: {
       opacity: 0.8,
     },
     buttonText: {
       marginLeft: 8,
       fontSize: 16,
       fontWeight: '600',
       color: '#333333',
     },
     buttonTextDisabled: {
       color: '#999999',
     },
   });
   ```

4. **Create Google Auth Hook**
   ```typescript
   // src/auth/hooks/useGoogleAuth.ts
   
   import { useState, useEffect, useCallback } from 'react';
   import { GoogleAuthProvider, GoogleUserProfile } from '../providers/GoogleAuthProvider';
   import { useAuth } from './useAuth';
   
   export const useGoogleAuth = () => {
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
     const { user, setUser } = useAuth();
   
     const signInWithGoogle = useCallback(async () => {
       setIsLoading(true);
       setError(null);
   
       try {
         const googleProvider = GoogleAuthProvider.getInstance();
         const response = await googleProvider.signIn();
   
         if (response.user) {
           const userProfile = await googleProvider.getUserProfile();
           setUser(userProfile);
           return userProfile;
         }
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         throw authError;
       } finally {
         setIsLoading(false);
       }
     }, [setUser]);
   
     const signOutFromGoogle = useCallback(async () => {
       setIsLoading(true);
       setError(null);
   
       try {
         const googleProvider = GoogleAuthProvider.getInstance();
         await googleProvider.signOut();
         setUser(null);
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         throw authError;
       } finally {
         setIsLoading(false);
       }
     }, [setUser]);
   
     const refreshGoogleSession = useCallback(async () => {
       try {
         const googleProvider = GoogleAuthProvider.getInstance();
         await googleProvider.refreshSession();
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         throw authError;
       }
     }, []);
   
     const getUserProfile = useCallback(async (): Promise<GoogleUserProfile | null> => {
       try {
         const googleProvider = GoogleAuthProvider.getInstance();
         return await googleProvider.getUserProfile();
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         return null;
       }
     }, []);
   
     return {
       user,
       isLoading,
       error,
       signInWithGoogle,
       signOutFromGoogle,
       refreshGoogleSession,
       getUserProfile,
     };
   };
   ```

5. **Create Auth Types**
   ```typescript
   // src/types/auth.types.ts
   
   export interface AuthUser {
     id: string;
     email: string;
     firstName?: string;
     lastName?: string;
     profileImage?: string;
     provider: 'google' | 'apple';
     isProfileComplete: boolean;
   }
   
   export interface AuthState {
     user: AuthUser | null;
     isLoading: boolean;
     isAuthenticated: boolean;
     error: string | null;
   }
   
   export interface AuthContextType extends AuthState {
     signIn: (provider: 'google' | 'apple') => Promise<void>;
     signOut: () => Promise<void>;
     refreshSession: () => Promise<void>;
     clearError: () => void;
   }
   
   export interface OAuthResponse {
     user: AuthUser | null;
     session: any;
     error: string | null;
   }
   ```

6. **Create Auth Utilities**
   ```typescript
   // src/utils/authUtils.ts
   
   import { GoogleUserProfile } from '@/auth/providers/GoogleAuthProvider';
   import { AuthUser } from '@/types/auth.types';
   
   export const mapGoogleProfileToAuthUser = (
     googleProfile: GoogleUserProfile
   ): AuthUser => {
     return {
       id: googleProfile.id,
       email: googleProfile.email,
       firstName: googleProfile.firstName,
       lastName: googleProfile.lastName,
       profileImage: googleProfile.profileImage,
       provider: googleProfile.provider,
       isProfileComplete: !!(googleProfile.firstName && googleProfile.lastName),
     };
   };
   
   export const validateEmail = (email: string): boolean => {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
   };
   
   export const formatUserName = (firstName?: string, lastName?: string): string => {
     if (firstName && lastName) {
       return `${firstName} ${lastName}`;
     }
     if (firstName) {
       return firstName;
     }
     if (lastName) {
       return lastName;
     }
     return 'User';
   };
   
   export const getInitials = (firstName?: string, lastName?: string): string => {
     const first = firstName?.charAt(0).toUpperCase() || '';
     const last = lastName?.charAt(0).toUpperCase() || '';
     return `${first}${last}`;
   };
   ```

**Key Implementation Details**:
- **Design Patterns**: Singleton pattern for GoogleAuthProvider, Observer pattern for auth state
- **Error Handling**: Comprehensive error handling for OAuth failures
- **Data Validation**: Email validation and profile data validation
- **Performance Considerations**: Efficient token handling and minimal API calls

### Testing Requirements

**Unit Tests**:
- [ ] GoogleAuthProvider class tests
- [ ] GoogleSignInButton component tests
- [ ] useGoogleAuth hook tests
- [ ] Auth utility function tests

**Integration Tests**:
- [ ] Google OAuth flow integration tests
- [ ] Supabase Auth integration tests
- [ ] User profile mapping tests

**Manual Testing Steps**:
1. Test Google OAuth sign-in flow
2. Verify user profile mapping
3. Test error handling scenarios
4. Validate loading states
5. Test sign-out functionality

### Code Quality Standards

**Code Requirements**:
- [ ] Follow React Native best practices
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure accessibility compliance

**Security Requirements**:
- [ ] Secure OAuth flow implementation
- [ ] Token validation and security
- [ ] User data protection
- [ ] OAuth state validation

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] Google OAuth integration working
- [ ] User profile mapping functional
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- OAuth configuration issues - Mitigation: Use environment variables and validation
- Token refresh complexity - Mitigation: Implement robust refresh logic
- User profile mapping errors - Mitigation: Add comprehensive error handling

**Research Required**:
- Latest Google OAuth requirements
- React Native OAuth best practices
- Supabase Auth integration patterns

### Additional Resources
**Reference Materials**:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
- [React Native OAuth Best Practices](https://reactnative.dev/docs/security)

**Related Code**:
- Supabase Auth configuration from ST-MT-3-1
- Authentication state management from ST-MT-3-4
- JWT token handling from ST-MT-3-5 