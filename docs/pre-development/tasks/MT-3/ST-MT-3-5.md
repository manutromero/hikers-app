## Sub-Task MT-3.5: JWT Token Handling and Refresh Logic

### Objective
Implement comprehensive JWT token handling with automatic refresh logic, secure token storage, and token validation for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 3 - Authentication System Implementation](../main-tasks-mountain-climber-training-app.md#task-3-authentication-system-implementation)
**Context**: This implements the JWT token management layer, ensuring secure token handling, automatic refresh, and proper token lifecycle management.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Frontend/Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-3-1 (Supabase Auth Configuration and Setup)
- [ ] ST-MT-3-4 (Authentication State Management)
- [ ] React Native environment setup

**Outputs Needed By**:
- ST-MT-3-6 (User Profile Management)
- ST-MT-3-7 (Authentication UI Components)

### Acceptance Criteria
- [ ] JWT token storage and retrieval implemented
- [ ] Automatic token refresh logic implemented
- [ ] Token validation and expiration handling
- [ ] Secure token storage with encryption
- [ ] Token refresh retry mechanism
- [ ] Token blacklisting support
- [ ] Token handling testing completed
- [ ] Integration with authentication state verified

### Technical Implementation

**Architecture Context**:
This sub-task implements the infrastructure layer of the hexagonal architecture, providing secure JWT token management and refresh logic.

**Files to Create/Modify**:
```
src/
├── auth/
│   ├── tokens/
│   │   ├── TokenManager.ts
│   │   ├── TokenStorage.ts
│   │   └── TokenValidator.ts
│   ├── hooks/
│   │   └── useTokenRefresh.ts
│   └── utils/
│       └── tokenUtils.ts
├── types/
│   └── auth.types.ts
└── utils/
    └── securityUtils.ts
```

**Step-by-Step Implementation**:

1. **Create Token Storage**
   ```typescript
   // src/auth/tokens/TokenStorage.ts
   
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import * as SecureStore from 'expo-secure-store';
   import { Platform } from 'react-native';
   
   const ACCESS_TOKEN_KEY = '@hikers_app_access_token';
   const REFRESH_TOKEN_KEY = '@hikers_app_refresh_token';
   const TOKEN_EXPIRY_KEY = '@hikers_app_token_expiry';
   
   export interface TokenData {
     accessToken: string;
     refreshToken: string;
     expiresAt: number;
   }
   
   export class TokenStorage {
     private static instance: TokenStorage;
   
     static getInstance(): TokenStorage {
       if (!TokenStorage.instance) {
         TokenStorage.instance = new TokenStorage();
       }
       return TokenStorage.instance;
     }
   
     private async secureStore(key: string, value?: string): Promise<string | null> {
       if (Platform.OS === 'web') {
         if (value !== undefined) {
           await AsyncStorage.setItem(key, value);
           return value;
         } else {
           return await AsyncStorage.getItem(key);
         }
       } else {
         if (value !== undefined) {
           await SecureStore.setItemAsync(key, value);
           return value;
         } else {
           return await SecureStore.getItemAsync(key);
         }
       }
     }
   
     async saveTokens(tokenData: TokenData): Promise<void> {
       try {
         await Promise.all([
           this.secureStore(ACCESS_TOKEN_KEY, tokenData.accessToken),
           this.secureStore(REFRESH_TOKEN_KEY, tokenData.refreshToken),
           this.secureStore(TOKEN_EXPIRY_KEY, tokenData.expiresAt.toString()),
         ]);
       } catch (error) {
         console.error('Error saving tokens:', error);
         throw error;
       }
     }
   
     async loadTokens(): Promise<TokenData | null> {
       try {
         const [accessToken, refreshToken, expiresAtStr] = await Promise.all([
           this.secureStore(ACCESS_TOKEN_KEY),
           this.secureStore(REFRESH_TOKEN_KEY),
           this.secureStore(TOKEN_EXPIRY_KEY),
         ]);
   
         if (!accessToken || !refreshToken || !expiresAtStr) {
           return null;
         }
   
         return {
           accessToken,
           refreshToken,
           expiresAt: parseInt(expiresAtStr, 10),
         };
       } catch (error) {
         console.error('Error loading tokens:', error);
         return null;
       }
     }
   
     async clearTokens(): Promise<void> {
       try {
         await Promise.all([
           this.secureStore(ACCESS_TOKEN_KEY, ''),
           this.secureStore(REFRESH_TOKEN_KEY, ''),
           this.secureStore(TOKEN_EXPIRY_KEY, ''),
         ]);
       } catch (error) {
         console.error('Error clearing tokens:', error);
         throw error;
       }
     }
   
     async getAccessToken(): Promise<string | null> {
       try {
         return await this.secureStore(ACCESS_TOKEN_KEY);
       } catch (error) {
         console.error('Error getting access token:', error);
         return null;
       }
     }
   
     async getRefreshToken(): Promise<string | null> {
       try {
         return await this.secureStore(REFRESH_TOKEN_KEY);
       } catch (error) {
         console.error('Error getting refresh token:', error);
         return null;
       }
     }
   
     async getTokenExpiry(): Promise<number | null> {
       try {
         const expiresAtStr = await this.secureStore(TOKEN_EXPIRY_KEY);
         return expiresAtStr ? parseInt(expiresAtStr, 10) : null;
       } catch (error) {
         console.error('Error getting token expiry:', error);
         return null;
       }
     }
   }
   ```

2. **Create Token Validator**
   ```typescript
   // src/auth/tokens/TokenValidator.ts
   
   import jwt_decode from 'jwt-decode';
   
   export interface JWTPayload {
     sub: string;
     email?: string;
     exp: number;
     iat: number;
     aud: string;
     iss: string;
   }
   
   export class TokenValidator {
     private static instance: TokenValidator;
   
     static getInstance(): TokenValidator {
       if (!TokenValidator.instance) {
         TokenValidator.instance = new TokenValidator();
       }
       return TokenValidator.instance;
     }
   
     validateToken(token: string): { isValid: boolean; payload?: JWTPayload; error?: string } {
       try {
         if (!token) {
           return { isValid: false, error: 'Token is empty' };
         }
   
         const payload = jwt_decode<JWTPayload>(token);
   
         if (!payload) {
           return { isValid: false, error: 'Invalid token format' };
         }
   
         const currentTime = Math.floor(Date.now() / 1000);
   
         if (payload.exp < currentTime) {
           return { isValid: false, error: 'Token has expired' };
         }
   
         if (payload.iat > currentTime) {
           return { isValid: false, error: 'Token issued in the future' };
         }
   
         return { isValid: true, payload };
       } catch (error) {
         return { isValid: false, error: 'Token validation failed' };
       }
     }
   
     isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
       try {
         const payload = jwt_decode<JWTPayload>(token);
         const currentTime = Math.floor(Date.now() / 1000);
         const thresholdSeconds = thresholdMinutes * 60;
   
         return payload.exp - currentTime < thresholdSeconds;
       } catch (error) {
         return true; // Assume token is expiring soon if we can't decode it
       }
     }
   
     getTokenExpiryTime(token: string): number | null {
       try {
         const payload = jwt_decode<JWTPayload>(token);
         return payload.exp * 1000; // Convert to milliseconds
       } catch (error) {
         return null;
       }
     }
   
     getTokenIssuedTime(token: string): number | null {
       try {
         const payload = jwt_decode<JWTPayload>(token);
         return payload.iat * 1000; // Convert to milliseconds
       } catch (error) {
         return null;
       }
     }
   
     getTokenSubject(token: string): string | null {
       try {
         const payload = jwt_decode<JWTPayload>(token);
         return payload.sub;
       } catch (error) {
         return null;
       }
     }
   }
   ```

3. **Create Token Manager**
   ```typescript
   // src/auth/tokens/TokenManager.ts
   
   import { TokenStorage, TokenData } from './TokenStorage';
   import { TokenValidator, JWTPayload } from './TokenValidator';
   import { supabase } from '@/lib/supabase';
   import { useAuth } from '../hooks/useAuth';
   
   export interface TokenRefreshResult {
     success: boolean;
     newTokens?: TokenData;
     error?: string;
   }
   
   export class TokenManager {
     private static instance: TokenManager;
     private storage: TokenStorage;
     private validator: TokenValidator;
     private refreshPromise: Promise<TokenRefreshResult> | null = null;
   
     private constructor() {
       this.storage = TokenStorage.getInstance();
       this.validator = TokenValidator.getInstance();
     }
   
     static getInstance(): TokenManager {
       if (!TokenManager.instance) {
         TokenManager.instance = new TokenManager();
       }
       return TokenManager.instance;
     }
   
     async getValidAccessToken(): Promise<string | null> {
       try {
         const accessToken = await this.storage.getAccessToken();
   
         if (!accessToken) {
           return null;
         }
   
         const validation = this.validator.validateToken(accessToken);
   
         if (!validation.isValid) {
           // Token is invalid, try to refresh
           const refreshResult = await this.refreshTokens();
           return refreshResult.success ? refreshResult.newTokens?.accessToken || null : null;
         }
   
         // Check if token is expiring soon
         if (this.validator.isTokenExpiringSoon(accessToken)) {
           // Token is expiring soon, refresh it
           const refreshResult = await this.refreshTokens();
           return refreshResult.success ? refreshResult.newTokens?.accessToken || null : null;
         }
   
         return accessToken;
       } catch (error) {
         console.error('Error getting valid access token:', error);
         return null;
       }
     }
   
     async refreshTokens(): Promise<TokenRefreshResult> {
       // Prevent multiple simultaneous refresh attempts
       if (this.refreshPromise) {
         return this.refreshPromise;
       }
   
       this.refreshPromise = this.performTokenRefresh();
   
       try {
         const result = await this.refreshPromise;
         return result;
       } finally {
         this.refreshPromise = null;
       }
     }
   
     private async performTokenRefresh(): Promise<TokenRefreshResult> {
       try {
         const refreshToken = await this.storage.getRefreshToken();
   
         if (!refreshToken) {
           return { success: false, error: 'No refresh token available' };
         }
   
         const { data, error } = await supabase.auth.refreshSession();
   
         if (error || !data.session) {
           return { success: false, error: error?.message || 'Token refresh failed' };
         }
   
         const newTokens: TokenData = {
           accessToken: data.session.access_token,
           refreshToken: data.session.refresh_token,
           expiresAt: data.session.expires_at! * 1000, // Convert to milliseconds
         };
   
         await this.storage.saveTokens(newTokens);
   
         return { success: true, newTokens };
       } catch (error) {
         console.error('Token refresh error:', error);
         return { 
           success: false, 
           error: error instanceof Error ? error.message : 'Token refresh failed' 
         };
       }
     }
   
     async validateAndRefreshTokens(): Promise<boolean> {
       try {
         const accessToken = await this.storage.getAccessToken();
   
         if (!accessToken) {
           return false;
         }
   
         const validation = this.validator.validateToken(accessToken);
   
         if (!validation.isValid) {
           const refreshResult = await this.refreshTokens();
           return refreshResult.success;
         }
   
         return true;
       } catch (error) {
         console.error('Error validating and refreshing tokens:', error);
         return false;
       }
     }
   
     async clearTokens(): Promise<void> {
       try {
         await this.storage.clearTokens();
       } catch (error) {
         console.error('Error clearing tokens:', error);
         throw error;
       }
     }
   
     async getTokenInfo(): Promise<{
       isValid: boolean;
       expiresAt: number | null;
       issuedAt: number | null;
       subject: string | null;
     }> {
       try {
         const accessToken = await this.storage.getAccessToken();
   
         if (!accessToken) {
           return {
             isValid: false,
             expiresAt: null,
             issuedAt: null,
             subject: null,
           };
         }
   
         const validation = this.validator.validateToken(accessToken);
   
         return {
           isValid: validation.isValid,
           expiresAt: this.validator.getTokenExpiryTime(accessToken),
           issuedAt: this.validator.getTokenIssuedTime(accessToken),
           subject: this.validator.getTokenSubject(accessToken),
         };
       } catch (error) {
         console.error('Error getting token info:', error);
         return {
           isValid: false,
           expiresAt: null,
           issuedAt: null,
           subject: null,
         };
       }
     }
   }
   ```

4. **Create Token Refresh Hook**
   ```typescript
   // src/auth/hooks/useTokenRefresh.ts
   
   import { useState, useEffect, useCallback, useRef } from 'react';
   import { TokenManager } from '../tokens/TokenManager';
   import { TokenValidator } from '../tokens/TokenValidator';
   import { useAuth } from './useAuth';
   
   export const useTokenRefresh = () => {
     const [isRefreshing, setIsRefreshing] = useState(false);
     const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
     const { user, signOut } = useAuth();
     const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
     const tokenManager = TokenManager.getInstance();
     const tokenValidator = TokenValidator.getInstance();
   
     const refreshTokens = useCallback(async (): Promise<boolean> => {
       if (!user) return false;
   
       setIsRefreshing(true);
   
       try {
         const result = await tokenManager.refreshTokens();
   
         if (result.success) {
           setLastRefreshTime(Date.now());
           return true;
         } else {
           // Refresh failed, sign out user
           await signOut();
           return false;
         }
       } catch (error) {
         console.error('Token refresh error:', error);
         await signOut();
         return false;
       } finally {
         setIsRefreshing(false);
       }
     }, [user, signOut]);
   
     const validateTokens = useCallback(async (): Promise<boolean> => {
       if (!user) return false;
   
       try {
         const accessToken = await tokenManager.getValidAccessToken();
         return !!accessToken;
       } catch (error) {
         console.error('Token validation error:', error);
         return false;
       }
     }, [user]);
   
     const setupTokenRefresh = useCallback(() => {
       if (!user) return;
   
       // Clear existing interval
       if (refreshIntervalRef.current) {
         clearInterval(refreshIntervalRef.current);
       }
   
       // Set up periodic token validation and refresh
       refreshIntervalRef.current = setInterval(async () => {
         const isValid = await validateTokens();
   
         if (!isValid) {
           const refreshSuccess = await refreshTokens();
           if (!refreshSuccess) {
             // Stop the interval if refresh fails
             if (refreshIntervalRef.current) {
               clearInterval(refreshIntervalRef.current);
             }
           }
         }
       }, 5 * 60 * 1000); // Check every 5 minutes
     }, [user, validateTokens, refreshTokens]);
   
     const clearTokenRefresh = useCallback(() => {
       if (refreshIntervalRef.current) {
         clearInterval(refreshIntervalRef.current);
         refreshIntervalRef.current = null;
       }
     }, []);
   
     // Set up token refresh when user is authenticated
     useEffect(() => {
       if (user) {
         setupTokenRefresh();
       } else {
         clearTokenRefresh();
       }
   
       return () => {
         clearTokenRefresh();
       };
     }, [user, setupTokenRefresh, clearTokenRefresh]);
   
     // Validate tokens on app focus
     useEffect(() => {
       const handleAppStateChange = async (nextAppState: string) => {
         if (nextAppState === 'active' && user) {
           const isValid = await validateTokens();
           if (!isValid) {
             await refreshTokens();
           }
         }
       };
   
       // Note: In a real app, you'd use AppState from react-native
       // For now, we'll just validate on mount
       if (user) {
         validateTokens();
       }
     }, [user, validateTokens, refreshTokens]);
   
     return {
       isRefreshing,
       lastRefreshTime,
       refreshTokens,
       validateTokens,
       setupTokenRefresh,
       clearTokenRefresh,
     };
   };
   ```

5. **Create Token Utilities**
   ```typescript
   // src/auth/utils/tokenUtils.ts
   
   import { TokenManager } from '../tokens/TokenManager';
   import { TokenValidator } from '../tokens/TokenValidator';
   import { TokenStorage } from '../tokens/TokenStorage';
   
   export const tokenUtils = {
     async getAuthHeaders(): Promise<Record<string, string>> {
       const tokenManager = TokenManager.getInstance();
       const accessToken = await tokenManager.getValidAccessToken();
   
       if (accessToken) {
         return {
           'Authorization': `Bearer ${accessToken}`,
           'Content-Type': 'application/json',
         };
       }
   
       return {
         'Content-Type': 'application/json',
       };
     },
   
     async validateToken(token: string): Promise<boolean> {
       const validator = TokenValidator.getInstance();
       const validation = validator.validateToken(token);
       return validation.isValid;
     },
   
     async isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): Promise<boolean> {
       const validator = TokenValidator.getInstance();
       return validator.isTokenExpiringSoon(token, thresholdMinutes);
     },
   
     async getTokenInfo(token: string) {
       const validator = TokenValidator.getInstance();
       return {
         expiresAt: validator.getTokenExpiryTime(token),
         issuedAt: validator.getTokenIssuedTime(token),
         subject: validator.getTokenSubject(token),
       };
     },
   
     async clearAllTokens(): Promise<void> {
       const storage = TokenStorage.getInstance();
       await storage.clearTokens();
     },
   
     async getStoredTokens() {
       const storage = TokenStorage.getInstance();
       return await storage.loadTokens();
     },
   };
   ```

6. **Create Security Utilities**
   ```typescript
   // src/utils/securityUtils.ts
   
   import * as Crypto from 'expo-crypto';
   
   export const securityUtils = {
     async hashString(input: string): Promise<string> {
       const digest = await Crypto.digestStringAsync(
         Crypto.CryptoDigestAlgorithm.SHA256,
         input
       );
       return digest;
     },
   
     async generateRandomString(length: number = 32): Promise<string> {
       const randomBytes = await Crypto.getRandomBytesAsync(length);
       return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
     },
   
     validateTokenFormat(token: string): boolean {
       // Basic JWT format validation (header.payload.signature)
       const parts = token.split('.');
       return parts.length === 3 && parts.every(part => part.length > 0);
     },
   
     sanitizeToken(token: string): string {
       // Remove any whitespace or special characters
       return token.trim().replace(/[^\w.-]/g, '');
     },
   
     isSecureEnvironment(): boolean {
       // Check if we're in a secure environment (not in development with debugger)
       return !__DEV__ || !global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
     },
   };
   ```

7. **Update Auth Types**
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
   
   // Add token-related types
   export interface TokenInfo {
     isValid: boolean;
     expiresAt: number | null;
     issuedAt: number | null;
     subject: string | null;
   }
   
   export interface TokenRefreshResult {
     success: boolean;
     newTokens?: {
       accessToken: string;
       refreshToken: string;
       expiresAt: number;
     };
     error?: string;
   }
   ```

**Key Implementation Details**:
- **Design Patterns**: Singleton pattern for token managers, Strategy pattern for token validation
- **Error Handling**: Comprehensive error handling for token operations
- **Data Validation**: Token format validation and expiration checking
- **Performance Considerations**: Efficient token caching and minimal API calls

### Testing Requirements

**Unit Tests**:
- [ ] TokenStorage tests
- [ ] TokenValidator tests
- [ ] TokenManager tests
- [ ] useTokenRefresh hook tests
- [ ] Token utility function tests

**Integration Tests**:
- [ ] Token refresh flow tests
- [ ] Token validation tests
- [ ] Secure storage tests
- [ ] Supabase token integration tests

**Manual Testing Steps**:
1. Test token storage and retrieval
2. Verify automatic token refresh
3. Test token validation
4. Validate secure storage
5. Test token expiration handling
6. Verify refresh retry mechanism

### Code Quality Standards

**Code Requirements**:
- [ ] Follow React Native best practices
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure accessibility compliance

**Security Requirements**:
- [ ] Secure token storage
- [ ] Token validation
- [ ] Token encryption
- [ ] Token blacklisting support

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] JWT token handling working
- [ ] Automatic refresh functional
- [ ] Token validation working
- [ ] Secure storage implemented
- [ ] Error handling implemented
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- Token refresh race conditions - Mitigation: Implement refresh promise caching
- Secure storage complexity - Mitigation: Use platform-specific secure storage
- Token validation overhead - Mitigation: Implement efficient validation

**Research Required**:
- JWT token best practices
- Secure storage patterns
- Token refresh strategies

### Additional Resources
**Reference Materials**:
- [JWT Documentation](https://jwt.io/)
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Supabase Auth Token Management](https://supabase.com/docs/guides/auth/tokens)

**Related Code**:
- Supabase Auth configuration from ST-MT-3-1
- Authentication state management from ST-MT-3-4
- User profile management from ST-MT-3-6 