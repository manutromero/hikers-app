## Sub-Task MT-3.3: OAuth Provider Integration (Apple)

### Objective
Implement Apple Sign-In integration with proper authentication flow, token handling, and user profile mapping for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 3 - Authentication System Implementation](../main-tasks-mountain-climber-training-app.md#task-3-authentication-system-implementation)
**Context**: This implements the Apple Sign-In authentication flow, enabling users to sign in with their Apple IDs securely.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Frontend/Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-3-1 (Supabase Auth Configuration and Setup)
- [ ] Apple Sign-In credentials configured in Supabase
- [ ] React Native environment setup
- [ ] Apple Developer account configured

**Outputs Needed By**:
- ST-MT-3-4 (Authentication State Management)
- ST-MT-3-5 (JWT Token Handling and Refresh Logic)

### Acceptance Criteria
- [ ] Apple Sign-In client configuration implemented
- [ ] Apple Sign-In button component created
- [ ] OAuth flow handling implemented
- [ ] User profile mapping from Apple data
- [ ] Error handling for OAuth failures
- [ ] Loading states and user feedback
- [ ] OAuth flow testing completed
- [ ] Integration with Supabase Auth verified

### Technical Implementation

**Architecture Context**:
This sub-task implements the application layer of the hexagonal architecture, providing Apple Sign-In authentication services and UI components.

**Files to Create/Modify**:
```
src/
├── auth/
│   ├── providers/
│   │   ├── AppleAuthProvider.ts
│   │   └── appleAuthConfig.ts
│   ├── components/
│   │   └── AppleSignInButton.tsx
│   └── hooks/
│       └── useAppleAuth.ts
├── types/
│   └── auth.types.ts
└── utils/
    └── authUtils.ts
```

**Step-by-Step Implementation**:

1. **Create Apple Sign-In Configuration**
   ```typescript
   // src/auth/providers/appleAuthConfig.ts
   
   export interface AppleAuthConfig {
     clientId: string;
     redirectUri: string;
     scopes: string[];
   }
   
   export const appleAuthConfig: AppleAuthConfig = {
     clientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || '',
     redirectUri: process.env.EXPO_PUBLIC_APPLE_REDIRECT_URI || '',
     scopes: ['name', 'email']
   };
   
   export const validateAppleConfig = (): boolean => {
     return !!(appleAuthConfig.clientId && appleAuthConfig.redirectUri);
   };
   ```

2. **Create Apple Auth Provider**
   ```typescript
   // src/auth/providers/AppleAuthProvider.ts
   
   import { supabase } from '@/lib/supabase';
   import { appleAuthConfig } from './appleAuthConfig';
   import { AuthError, AuthResponse } from '@supabase/supabase-js';
   
   export interface AppleUserProfile {
     id: string;
     email?: string;
     firstName?: string;
     lastName?: string;
     provider: 'apple';
   }
   
   export class AppleAuthProvider {
     private static instance: AppleAuthProvider;
   
     static getInstance(): AppleAuthProvider {
       if (!AppleAuthProvider.instance) {
         AppleAuthProvider.instance = new AppleAuthProvider();
       }
       return AppleAuthProvider.instance;
     }
   
     async signIn(): Promise<AuthResponse> {
       try {
         const { data, error } = await supabase.auth.signInWithOAuth({
           provider: 'apple',
           options: {
             redirectTo: appleAuthConfig.redirectUri,
             queryParams: {
               response_mode: 'form_post',
             },
           },
         });
   
         if (error) {
           throw new Error(`Apple Sign-In error: ${error.message}`);
         }
   
         return data;
       } catch (error) {
         console.error('Apple sign-in error:', error);
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
         console.error('Apple sign-out error:', error);
         throw error;
       }
     }
   
     async getUserProfile(): Promise<AppleUserProfile | null> {
       try {
         const { data: { user }, error } = await supabase.auth.getUser();
   
         if (error || !user) {
           return null;
         }
   
         const userMetadata = user.user_metadata;
         const providerData = userMetadata?.providers?.apple;
   
         return {
           id: user.id,
           email: user.email || providerData?.email,
           firstName: providerData?.first_name || userMetadata?.full_name?.split(' ')[0],
           lastName: providerData?.last_name || userMetadata?.full_name?.split(' ').slice(1).join(' '),
           provider: 'apple'
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
   
     async revokeAccess(): Promise<void> {
       try {
         // Apple Sign-In doesn't provide a direct revoke endpoint
         // This would typically be handled by signing out
         await this.signOut();
       } catch (error) {
         console.error('Revoke access error:', error);
         throw error;
       }
     }
   }
   ```

3. **Create Apple Sign-In Button Component**
   ```typescript
   // src/auth/components/AppleSignInButton.tsx
   
   import React, { useState } from 'react';
   import {
     TouchableOpacity,
     Text,
     StyleSheet,
     ActivityIndicator,
     View,
   } from 'react-native';
   import { Ionicons } from '@expo/vector-icons';
   import { AppleAuthProvider } from '../providers/AppleAuthProvider';
   import { useAuth } from '../hooks/useAuth';
   
   interface AppleSignInButtonProps {
     onSuccess?: () => void;
     onError?: (error: Error) => void;
     disabled?: boolean;
   }
   
   export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
     onSuccess,
     onError,
     disabled = false,
   }) => {
     const [isLoading, setIsLoading] = useState(false);
     const { setUser } = useAuth();
   
     const handleAppleSignIn = async () => {
       if (disabled || isLoading) return;
   
       setIsLoading(true);
   
       try {
         const appleProvider = AppleAuthProvider.getInstance();
         const response = await appleProvider.signIn();
   
         if (response.user) {
           const userProfile = await appleProvider.getUserProfile();
           setUser(userProfile);
           onSuccess?.();
         }
       } catch (error) {
         console.error('Apple sign-in failed:', error);
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
         onPress={handleAppleSignIn}
         disabled={disabled || isLoading}
         activeOpacity={0.8}
       >
         {isLoading ? (
           <ActivityIndicator color="#FFFFFF" size="small" />
         ) : (
           <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
         )}
         <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
           {isLoading ? 'Signing in...' : 'Continue with Apple'}
         </Text>
       </TouchableOpacity>
     );
   };
   
   const styles = StyleSheet.create({
     button: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'center',
       backgroundColor: '#000000',
       borderWidth: 1,
       borderColor: '#000000',
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
       color: '#FFFFFF',
     },
     buttonTextDisabled: {
       color: '#CCCCCC',
     },
   });
   ```

4. **Create Apple Auth Hook**
   ```typescript
   // src/auth/hooks/useAppleAuth.ts
   
   import { useState, useEffect, useCallback } from 'react';
   import { AppleAuthProvider, AppleUserProfile } from '../providers/AppleAuthProvider';
   import { useAuth } from './useAuth';
   
   export const useAppleAuth = () => {
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<Error | null>(null);
     const { user, setUser } = useAuth();
   
     const signInWithApple = useCallback(async () => {
       setIsLoading(true);
       setError(null);
   
       try {
         const appleProvider = AppleAuthProvider.getInstance();
         const response = await appleProvider.signIn();
   
         if (response.user) {
           const userProfile = await appleProvider.getUserProfile();
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
   
     const signOutFromApple = useCallback(async () => {
       setIsLoading(true);
       setError(null);
   
       try {
         const appleProvider = AppleAuthProvider.getInstance();
         await appleProvider.signOut();
         setUser(null);
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         throw authError;
       } finally {
         setIsLoading(false);
       }
     }, [setUser]);
   
     const refreshAppleSession = useCallback(async () => {
       try {
         const appleProvider = AppleAuthProvider.getInstance();
         await appleProvider.refreshSession();
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         throw authError;
       }
     }, []);
   
     const getUserProfile = useCallback(async (): Promise<AppleUserProfile | null> => {
       try {
         const appleProvider = AppleAuthProvider.getInstance();
         return await appleProvider.getUserProfile();
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         return null;
       }
     }, []);
   
     const revokeAppleAccess = useCallback(async () => {
       try {
         const appleProvider = AppleAuthProvider.getInstance();
         await appleProvider.revokeAccess();
         setUser(null);
       } catch (err) {
         const authError = err as Error;
         setError(authError);
         throw authError;
       }
     }, [setUser]);
   
     return {
       user,
       isLoading,
       error,
       signInWithApple,
       signOutFromApple,
       refreshAppleSession,
       getUserProfile,
       revokeAppleAccess,
     };
   };
   ```

5. **Update Auth Types**
   ```typescript
   // src/types/auth.types.ts (update existing file)
   
   export interface AuthUser {
     id: string;
     email?: string; // Apple may not provide email
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
   
   // Add Apple-specific types
   export interface AppleSignInResponse {
     user: {
       id: string;
       email?: string;
       name?: {
         firstName?: string;
         lastName?: string;
       };
     };
     authorization: {
       code: string;
       id_token: string;
     };
   }
   ```

6. **Update Auth Utilities**
   ```typescript
   // src/utils/authUtils.ts (update existing file)
   
   import { GoogleUserProfile } from '@/auth/providers/GoogleAuthProvider';
   import { AppleUserProfile } from '@/auth/providers/AppleAuthProvider';
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
   
   export const mapAppleProfileToAuthUser = (
     appleProfile: AppleUserProfile
   ): AuthUser => {
     return {
       id: appleProfile.id,
       email: appleProfile.email,
       firstName: appleProfile.firstName,
       lastName: appleProfile.lastName,
       provider: appleProfile.provider,
       isProfileComplete: !!(appleProfile.firstName && appleProfile.lastName),
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
   
   // Apple-specific utilities
   export const handleAppleEmailPrivacy = (email?: string): string | undefined => {
     // Apple may provide a private relay email or no email at all
     if (!email) return undefined;
     
     // Check if it's a private relay email (ends with @privaterelay.appleid.com)
     if (email.endsWith('@privaterelay.appleid.com')) {
       return email;
     }
     
     return email;
   };
   
   export const isApplePrivateEmail = (email: string): boolean => {
     return email.endsWith('@privaterelay.appleid.com');
   };
   ```

7. **Create Combined Auth Provider**
   ```typescript
   // src/auth/providers/CombinedAuthProvider.ts
   
   import { GoogleAuthProvider } from './GoogleAuthProvider';
   import { AppleAuthProvider } from './AppleAuthProvider';
   import { AuthUser } from '@/types/auth.types';
   import { mapGoogleProfileToAuthUser, mapAppleProfileToAuthUser } from '@/utils/authUtils';
   
   export class CombinedAuthProvider {
     private static instance: CombinedAuthProvider;
   
     static getInstance(): CombinedAuthProvider {
       if (!CombinedAuthProvider.instance) {
         CombinedAuthProvider.instance = new CombinedAuthProvider();
       }
       return CombinedAuthProvider.instance;
     }
   
     async signIn(provider: 'google' | 'apple'): Promise<AuthUser | null> {
       try {
         if (provider === 'google') {
           const googleProvider = GoogleAuthProvider.getInstance();
           const response = await googleProvider.signIn();
           if (response.user) {
             const profile = await googleProvider.getUserProfile();
             return profile ? mapGoogleProfileToAuthUser(profile) : null;
           }
         } else if (provider === 'apple') {
           const appleProvider = AppleAuthProvider.getInstance();
           const response = await appleProvider.signIn();
           if (response.user) {
             const profile = await appleProvider.getUserProfile();
             return profile ? mapAppleProfileToAuthUser(profile) : null;
           }
         }
         return null;
       } catch (error) {
         console.error(`${provider} sign-in error:`, error);
         throw error;
       }
     }
   
     async signOut(): Promise<void> {
       try {
         // Sign out from both providers to ensure complete logout
         const googleProvider = GoogleAuthProvider.getInstance();
         const appleProvider = AppleAuthProvider.getInstance();
   
         await Promise.all([
           googleProvider.signOut().catch(() => {}),
           appleProvider.signOut().catch(() => {})
         ]);
       } catch (error) {
         console.error('Combined sign-out error:', error);
         throw error;
       }
     }
   }
   ```

**Key Implementation Details**:
- **Design Patterns**: Singleton pattern for AppleAuthProvider, Strategy pattern for multiple providers
- **Error Handling**: Comprehensive error handling for Apple Sign-In failures
- **Data Validation**: Email privacy handling and profile data validation
- **Performance Considerations**: Efficient token handling and minimal API calls

### Testing Requirements

**Unit Tests**:
- [ ] AppleAuthProvider class tests
- [ ] AppleSignInButton component tests
- [ ] useAppleAuth hook tests
- [ ] Apple-specific utility function tests

**Integration Tests**:
- [ ] Apple Sign-In flow integration tests
- [ ] Supabase Auth integration tests
- [ ] User profile mapping tests
- [ ] Email privacy handling tests

**Manual Testing Steps**:
1. Test Apple Sign-In flow
2. Verify user profile mapping
3. Test email privacy handling
4. Test error handling scenarios
5. Validate loading states
6. Test sign-out functionality

### Code Quality Standards

**Code Requirements**:
- [ ] Follow React Native best practices
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure accessibility compliance

**Security Requirements**:
- [ ] Secure Apple Sign-In flow implementation
- [ ] Token validation and security
- [ ] User data protection
- [ ] Email privacy compliance

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] Apple Sign-In integration working
- [ ] User profile mapping functional
- [ ] Email privacy handling implemented
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- Apple Sign-In configuration complexity - Mitigation: Use proper configuration validation
- Email privacy handling - Mitigation: Implement proper email privacy logic
- Token refresh complexity - Mitigation: Implement robust refresh logic

**Research Required**:
- Latest Apple Sign-In requirements
- React Native Apple Sign-In best practices
- Email privacy handling strategies

### Additional Resources
**Reference Materials**:
- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Supabase Auth OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
- [React Native Apple Sign-In](https://github.com/invertase/react-native-apple-authentication)

**Related Code**:
- Supabase Auth configuration from ST-MT-3-1
- Google OAuth integration from ST-MT-3-2
- Authentication state management from ST-MT-3-4 