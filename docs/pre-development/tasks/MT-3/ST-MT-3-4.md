## Sub-Task MT-3.4: Authentication State Management

### Objective
Implement comprehensive authentication state management using React Context and hooks for managing user sessions, authentication status, and state persistence across the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 3 - Authentication System Implementation](../main-tasks-mountain-climber-training-app.md#task-3-authentication-system-implementation)
**Context**: This implements the state management layer for authentication, providing a centralized way to manage user sessions and authentication status throughout the app.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Frontend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-3-1 (Supabase Auth Configuration and Setup)
- [ ] ST-MT-3-2 (OAuth Provider Integration - Google)
- [ ] ST-MT-3-3 (OAuth Provider Integration - Apple)
- [ ] React Native environment setup

**Outputs Needed By**:
- ST-MT-3-5 (JWT Token Handling and Refresh Logic)
- ST-MT-3-6 (User Profile Management)
- ST-MT-3-7 (Authentication UI Components)

### Acceptance Criteria
- [ ] Authentication context provider implemented
- [ ] Authentication state management with React Context
- [ ] User session persistence across app restarts
- [ ] Authentication state synchronization with Supabase
- [ ] Loading states and error handling
- [ ] Authentication state validation
- [ ] State management testing completed
- [ ] Integration with OAuth providers verified

### Technical Implementation

**Architecture Context**:
This sub-task implements the application layer of the hexagonal architecture, providing centralized authentication state management using React Context and hooks.

**Files to Create/Modify**:
```
src/
├── auth/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AuthProvider.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useAuthState.ts
│   ├── reducers/
│   │   └── authReducer.ts
│   └── storage/
│       └── authStorage.ts
├── types/
│   └── auth.types.ts
└── utils/
    └── authUtils.ts
```

**Step-by-Step Implementation**:

1. **Create Authentication Reducer**
   ```typescript
   // src/auth/reducers/authReducer.ts
   
   import { AuthState, AuthAction, AuthUser } from '@/types/auth.types';
   
   export const initialAuthState: AuthState = {
     user: null,
     isLoading: true,
     isAuthenticated: false,
     error: null,
     isInitialized: false,
   };
   
   export type AuthActionType = 
     | 'AUTH_START'
     | 'AUTH_SUCCESS'
     | 'AUTH_FAILURE'
     | 'AUTH_LOGOUT'
     | 'AUTH_UPDATE_USER'
     | 'AUTH_CLEAR_ERROR'
     | 'AUTH_INITIALIZE'
     | 'AUTH_REFRESH_START'
     | 'AUTH_REFRESH_SUCCESS'
     | 'AUTH_REFRESH_FAILURE';
   
   export interface AuthAction {
     type: AuthActionType;
     payload?: {
       user?: AuthUser | null;
       error?: string | null;
       isLoading?: boolean;
     };
   }
   
   export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
     switch (action.type) {
       case 'AUTH_START':
         return {
           ...state,
           isLoading: true,
           error: null,
         };
   
       case 'AUTH_SUCCESS':
         return {
           ...state,
           user: action.payload?.user || null,
           isLoading: false,
           isAuthenticated: !!action.payload?.user,
           error: null,
           isInitialized: true,
         };
   
       case 'AUTH_FAILURE':
         return {
           ...state,
           user: null,
           isLoading: false,
           isAuthenticated: false,
           error: action.payload?.error || 'Authentication failed',
           isInitialized: true,
         };
   
       case 'AUTH_LOGOUT':
         return {
           ...state,
           user: null,
           isLoading: false,
           isAuthenticated: false,
           error: null,
           isInitialized: true,
         };
   
       case 'AUTH_UPDATE_USER':
         return {
           ...state,
           user: action.payload?.user || null,
           isAuthenticated: !!action.payload?.user,
         };
   
       case 'AUTH_CLEAR_ERROR':
         return {
           ...state,
           error: null,
         };
   
       case 'AUTH_INITIALIZE':
         return {
           ...state,
           isLoading: true,
           isInitialized: false,
         };
   
       case 'AUTH_REFRESH_START':
         return {
           ...state,
           isLoading: true,
         };
   
       case 'AUTH_REFRESH_SUCCESS':
         return {
           ...state,
           user: action.payload?.user || state.user,
           isLoading: false,
           isAuthenticated: !!action.payload?.user,
           error: null,
         };
   
       case 'AUTH_REFRESH_FAILURE':
         return {
           ...state,
           isLoading: false,
           error: action.payload?.error || 'Session refresh failed',
         };
   
       default:
         return state;
     }
   };
   ```

2. **Create Authentication Storage**
   ```typescript
   // src/auth/storage/authStorage.ts
   
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { AuthUser } from '@/types/auth.types';
   
   const AUTH_STORAGE_KEY = '@hikers_app_auth';
   const USER_STORAGE_KEY = '@hikers_app_user';
   const SESSION_STORAGE_KEY = '@hikers_app_session';
   
   export class AuthStorage {
     static async saveAuthState(authState: {
       user: AuthUser | null;
       session: any;
     }): Promise<void> {
       try {
         await Promise.all([
           AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authState.user)),
           AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authState.session)),
         ]);
       } catch (error) {
         console.error('Error saving auth state:', error);
         throw error;
       }
     }
   
     static async loadAuthState(): Promise<{
       user: AuthUser | null;
       session: any;
     }> {
       try {
         const [userData, sessionData] = await Promise.all([
           AsyncStorage.getItem(USER_STORAGE_KEY),
           AsyncStorage.getItem(SESSION_STORAGE_KEY),
         ]);
   
         return {
           user: userData ? JSON.parse(userData) : null,
           session: sessionData ? JSON.parse(sessionData) : null,
         };
       } catch (error) {
         console.error('Error loading auth state:', error);
         return { user: null, session: null };
       }
     }
   
     static async clearAuthState(): Promise<void> {
       try {
         await Promise.all([
           AsyncStorage.removeItem(USER_STORAGE_KEY),
           AsyncStorage.removeItem(SESSION_STORAGE_KEY),
         ]);
       } catch (error) {
         console.error('Error clearing auth state:', error);
         throw error;
       }
     }
   
     static async saveUser(user: AuthUser): Promise<void> {
       try {
         await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
       } catch (error) {
         console.error('Error saving user:', error);
         throw error;
       }
     }
   
     static async loadUser(): Promise<AuthUser | null> {
       try {
         const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
         return userData ? JSON.parse(userData) : null;
       } catch (error) {
         console.error('Error loading user:', error);
         return null;
       }
     }
   
     static async saveSession(session: any): Promise<void> {
       try {
         await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
       } catch (error) {
         console.error('Error saving session:', error);
         throw error;
       }
     }
   
     static async loadSession(): Promise<any> {
       try {
         const sessionData = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
         return sessionData ? JSON.parse(sessionData) : null;
       } catch (error) {
         console.error('Error loading session:', error);
         return null;
       }
     }
   }
   ```

3. **Create Authentication Context**
   ```typescript
   // src/auth/context/AuthContext.tsx
   
   import React, { createContext, useContext, useReducer, useEffect } from 'react';
   import { AuthState, AuthAction, AuthUser } from '@/types/auth.types';
   import { authReducer, initialAuthState } from '../reducers/authReducer';
   import { AuthStorage } from '../storage/authStorage';
   import { supabase } from '@/lib/supabase';
   import { CombinedAuthProvider } from '../providers/CombinedAuthProvider';
   
   interface AuthContextType extends AuthState {
     signIn: (provider: 'google' | 'apple') => Promise<void>;
     signOut: () => Promise<void>;
     refreshSession: () => Promise<void>;
     updateUser: (user: AuthUser) => void;
     clearError: () => void;
     initialize: () => Promise<void>;
   }
   
   const AuthContext = createContext<AuthContextType | undefined>(undefined);
   
   export const useAuthContext = (): AuthContextType => {
     const context = useContext(AuthContext);
     if (context === undefined) {
       throw new Error('useAuthContext must be used within an AuthProvider');
     }
     return context;
   };
   
   interface AuthProviderProps {
     children: React.ReactNode;
   }
   
   export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
     const [state, dispatch] = useReducer(authReducer, initialAuthState);
   
     const signIn = async (provider: 'google' | 'apple'): Promise<void> => {
       dispatch({ type: 'AUTH_START' });
   
       try {
         const authProvider = CombinedAuthProvider.getInstance();
         const user = await authProvider.signIn(provider);
   
         if (user) {
           await AuthStorage.saveUser(user);
           dispatch({ 
             type: 'AUTH_SUCCESS', 
             payload: { user } 
           });
         } else {
           throw new Error('Authentication failed');
         }
       } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
         dispatch({ 
           type: 'AUTH_FAILURE', 
           payload: { error: errorMessage } 
         });
         throw error;
       }
     };
   
     const signOut = async (): Promise<void> => {
       try {
         const authProvider = CombinedAuthProvider.getInstance();
         await authProvider.signOut();
         await AuthStorage.clearAuthState();
         dispatch({ type: 'AUTH_LOGOUT' });
       } catch (error) {
         console.error('Sign out error:', error);
         // Still clear local state even if server sign-out fails
         await AuthStorage.clearAuthState();
         dispatch({ type: 'AUTH_LOGOUT' });
       }
     };
   
     const refreshSession = async (): Promise<void> => {
       dispatch({ type: 'AUTH_REFRESH_START' });
   
       try {
         const { data: { session }, error } = await supabase.auth.refreshSession();
   
         if (error || !session) {
           throw new Error('Session refresh failed');
         }
   
         const { data: { user } } = await supabase.auth.getUser();
   
         if (user) {
           // Map user data to our AuthUser format
           const authUser: AuthUser = {
             id: user.id,
             email: user.email || undefined,
             firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0],
             lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
             profileImage: user.user_metadata?.avatar_url,
             provider: user.app_metadata?.provider || 'google',
             isProfileComplete: !!(user.user_metadata?.first_name && user.user_metadata?.last_name),
           };
   
           await AuthStorage.saveUser(authUser);
           await AuthStorage.saveSession(session);
   
           dispatch({ 
             type: 'AUTH_REFRESH_SUCCESS', 
             payload: { user: authUser } 
           });
         } else {
           throw new Error('User not found after session refresh');
         }
       } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';
         dispatch({ 
           type: 'AUTH_REFRESH_FAILURE', 
           payload: { error: errorMessage } 
         });
         throw error;
       }
     };
   
     const updateUser = (user: AuthUser): void => {
       AuthStorage.saveUser(user).catch(console.error);
       dispatch({ 
         type: 'AUTH_UPDATE_USER', 
         payload: { user } 
       });
     };
   
     const clearError = (): void => {
       dispatch({ type: 'AUTH_CLEAR_ERROR' });
     };
   
     const initialize = async (): Promise<void> => {
       dispatch({ type: 'AUTH_INITIALIZE' });
   
       try {
         // Load stored auth state
         const { user: storedUser, session: storedSession } = await AuthStorage.loadAuthState();
   
         if (storedUser && storedSession) {
           // Verify session is still valid
           const { data: { session }, error } = await supabase.auth.getSession();
   
           if (session && !error) {
             // Session is valid, use stored user
             dispatch({ 
               type: 'AUTH_SUCCESS', 
               payload: { user: storedUser } 
             });
           } else {
             // Session is invalid, try to refresh
             try {
               await refreshSession();
             } catch (refreshError) {
               // Refresh failed, clear stored data
               await AuthStorage.clearAuthState();
               dispatch({ type: 'AUTH_LOGOUT' });
             }
           }
         } else {
           // No stored auth state
           dispatch({ type: 'AUTH_LOGOUT' });
         }
       } catch (error) {
         console.error('Auth initialization error:', error);
         dispatch({ type: 'AUTH_LOGOUT' });
       }
     };
   
     // Initialize auth state on mount
     useEffect(() => {
       initialize();
     }, []);
   
     // Listen for auth state changes from Supabase
     useEffect(() => {
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         async (event, session) => {
           console.log('Auth state change:', event, session);
   
           switch (event) {
             case 'SIGNED_IN':
               if (session?.user) {
                 const authUser: AuthUser = {
                   id: session.user.id,
                   email: session.user.email || undefined,
                   firstName: session.user.user_metadata?.first_name || session.user.user_metadata?.full_name?.split(' ')[0],
                   lastName: session.user.user_metadata?.last_name || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
                   profileImage: session.user.user_metadata?.avatar_url,
                   provider: session.user.app_metadata?.provider || 'google',
                   isProfileComplete: !!(session.user.user_metadata?.first_name && session.user.user_metadata?.last_name),
                 };
   
                 await AuthStorage.saveUser(authUser);
                 await AuthStorage.saveSession(session);
   
                 dispatch({ 
                   type: 'AUTH_SUCCESS', 
                   payload: { user: authUser } 
                 });
               }
               break;
   
             case 'SIGNED_OUT':
               await AuthStorage.clearAuthState();
               dispatch({ type: 'AUTH_LOGOUT' });
               break;
   
             case 'TOKEN_REFRESHED':
               if (session) {
                 await AuthStorage.saveSession(session);
               }
               break;
           }
         }
       );
   
       return () => {
         subscription.unsubscribe();
       };
     }, []);
   
     const contextValue: AuthContextType = {
       ...state,
       signIn,
       signOut,
       refreshSession,
       updateUser,
       clearError,
       initialize,
     };
   
     return (
       <AuthContext.Provider value={contextValue}>
         {children}
       </AuthContext.Provider>
     );
   };
   ```

4. **Create Authentication Hook**
   ```typescript
   // src/auth/hooks/useAuth.ts
   
   import { useContext } from 'react';
   import { AuthContext } from '../context/AuthContext';
   
   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (context === undefined) {
       throw new Error('useAuth must be used within an AuthProvider');
     }
     return context;
   };
   ```

5. **Create Authentication State Hook**
   ```typescript
   // src/auth/hooks/useAuthState.ts
   
   import { useMemo } from 'react';
   import { useAuth } from './useAuth';
   import { AuthUser } from '@/types/auth.types';
   
   export const useAuthState = () => {
     const auth = useAuth();
   
     const isLoggedIn = useMemo(() => auth.isAuthenticated && !!auth.user, [auth.isAuthenticated, auth.user]);
     const isGuest = useMemo(() => !auth.isAuthenticated && !auth.isLoading, [auth.isAuthenticated, auth.isLoading]);
     const isInitializing = useMemo(() => auth.isLoading && !auth.isInitialized, [auth.isLoading, auth.isInitialized]);
   
     const userDisplayName = useMemo(() => {
       if (!auth.user) return '';
       const { firstName, lastName } = auth.user;
       if (firstName && lastName) return `${firstName} ${lastName}`;
       if (firstName) return firstName;
       if (lastName) return lastName;
       return auth.user.email || 'User';
     }, [auth.user]);
   
     const userInitials = useMemo(() => {
       if (!auth.user) return '';
       const { firstName, lastName } = auth.user;
       const first = firstName?.charAt(0).toUpperCase() || '';
       const last = lastName?.charAt(0).toUpperCase() || '';
       return `${first}${last}`;
     }, [auth.user]);
   
     return {
       ...auth,
       isLoggedIn,
       isGuest,
       isInitializing,
       userDisplayName,
       userInitials,
     };
   };
   ```

6. **Update Auth Types**
   ```typescript
   // src/types/auth.types.ts (update existing file)
   
   export interface AuthUser {
     id: string;
     email?: string;
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
     isInitialized: boolean;
   }
   
   export interface AuthContextType extends AuthState {
     signIn: (provider: 'google' | 'apple') => Promise<void>;
     signOut: () => Promise<void>;
     refreshSession: () => Promise<void>;
     updateUser: (user: AuthUser) => void;
     clearError: () => void;
     initialize: () => Promise<void>;
   }
   
   export interface OAuthResponse {
     user: AuthUser | null;
     session: any;
     error: string | null;
   }
   
   export interface AuthStorageData {
     user: AuthUser | null;
     session: any;
   }
   ```

**Key Implementation Details**:
- **Design Patterns**: Reducer pattern for state management, Observer pattern for auth state changes
- **Error Handling**: Comprehensive error handling for all auth operations
- **Data Validation**: User data validation and session validation
- **Performance Considerations**: Efficient state updates and minimal re-renders

### Testing Requirements

**Unit Tests**:
- [ ] AuthReducer tests
- [ ] AuthStorage tests
- [ ] AuthContext tests
- [ ] useAuth hook tests
- [ ] useAuthState hook tests

**Integration Tests**:
- [ ] Authentication state persistence tests
- [ ] Session refresh tests
- [ ] OAuth provider integration tests
- [ ] Supabase auth state change tests

**Manual Testing Steps**:
1. Test authentication state persistence
2. Verify session refresh functionality
3. Test auth state changes
4. Validate error handling
5. Test loading states
6. Verify user data updates

### Code Quality Standards

**Code Requirements**:
- [ ] Follow React Native best practices
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure accessibility compliance

**Security Requirements**:
- [ ] Secure state storage
- [ ] Session validation
- [ ] User data protection
- [ ] Token security

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] Authentication state management working
- [ ] State persistence functional
- [ ] Session refresh working
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- State synchronization issues - Mitigation: Implement proper state synchronization
- Session refresh complexity - Mitigation: Implement robust refresh logic
- Storage security - Mitigation: Use secure storage methods

**Research Required**:
- React Context best practices
- AsyncStorage security
- Session management patterns

### Additional Resources
**Reference Materials**:
- [React Context Documentation](https://react.dev/reference/react/createContext)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Supabase Auth State Management](https://supabase.com/docs/guides/auth/auth-helpers/react)

**Related Code**:
- Supabase Auth configuration from ST-MT-3-1
- OAuth provider integrations from ST-MT-3-2 and ST-MT-3-3
- JWT token handling from ST-MT-3-5 