# Sub-Task 1.4: State Management Configuration

### Objective
Configure Zustand for global state management and React Query for server state management, integrating them with the hexagonal architecture for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 1: Project Setup and Development Environment](../main-tasks-mountain-climber-training-app.md#task-1-project-setup-and-development-environment)
**Context**: This sub-task establishes the state management foundation that will handle both client-side state (Zustand) and server-side state (React Query) throughout the application.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: Medium
**Developer Type**: Frontend/Full-Stack

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-1-1 (Expo Project Initialization) completed
- [ ] ST-MT-1-2 (TypeScript and ESLint Configuration) completed
- [ ] ST-MT-1-3 (Hexagonal Architecture Setup) completed

**Outputs Needed By**:
- ST-MT-1-5 (Navigation Structure Setup)
- ST-MT-1-6 (Environment Configuration)
- All future feature development requiring state management

### Acceptance Criteria
- [ ] Zustand installed and configured for global state
- [ ] React Query installed and configured for server state
- [ ] Base stores created for authentication, user, and training state
- [ ] Query hooks created for API data fetching
- [ ] State persistence configured with AsyncStorage
- [ ] Error handling and loading states implemented
- [ ] TypeScript types defined for all state
- [ ] Integration with hexagonal architecture completed

### Technical Implementation

**Architecture Context**:
This sub-task implements state management that bridges the presentation layer with the application and infrastructure layers, following the hexagonal architecture principles.

**Files to Create/Modify**:
```
mountain-climber-training-app/
├── src/
│   ├── presentation/
│   │   ├── stores/
│   │   │   ├── index.ts
│   │   │   ├── authStore.ts
│   │   │   ├── userStore.ts
│   │   │   ├── trainingStore.ts
│   │   │   └── readinessStore.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useTraining.ts
│   │   │   └── useReadiness.ts
│   │   ├── providers/
│   │   │   ├── index.ts
│   │   │   ├── QueryProvider.tsx
│   │   │   └── StoreProvider.tsx
│   │   └── types/
│   │       ├── index.ts
│   │       ├── AuthState.ts
│   │       ├── UserState.ts
│   │       └── TrainingState.ts
│   └── shared/
│       └── utils/
│           ├── storage.ts
│           └── queryKeys.ts
```

**Step-by-Step Implementation**:

1. **Install Required Dependencies**:
   ```bash
   npm install zustand @tanstack/react-query @tanstack/react-query-devtools
   npm install @react-native-async-storage/async-storage
   npm install --save-dev zustand/middleware
   ```

2. **Create Base State Types**:

   **src/presentation/types/AuthState.ts**:
   ```typescript
   import { User } from '@/domain/entities/User';

   export interface AuthState {
     user: User | null;
     isAuthenticated: boolean;
     isLoading: boolean;
     error: string | null;
     session: {
       accessToken: string | null;
       refreshToken: string | null;
       expiresAt: Date | null;
     };
   }

   export interface AuthActions {
     login: (email: string, password: string) => Promise<void>;
     logout: () => void;
     refreshToken: () => Promise<void>;
     updateUser: (user: User) => void;
     setLoading: (loading: boolean) => void;
     setError: (error: string | null) => void;
     clearError: () => void;
   }

   export type AuthStore = AuthState & AuthActions;
   ```

   **src/presentation/types/UserState.ts**:
   ```typescript
   import { User, UserProfile } from '@/domain/entities/User';

   export interface UserState {
     currentUser: User | null;
     profile: UserProfile | null;
     isLoading: boolean;
     error: string | null;
   }

   export interface UserActions {
     fetchUser: (userId: string) => Promise<void>;
     updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
     setUser: (user: User) => void;
     clearUser: () => void;
     setLoading: (loading: boolean) => void;
     setError: (error: string | null) => void;
   }

   export type UserStore = UserState & UserActions;
   ```

3. **Create Zustand Stores**:

   **src/presentation/stores/authStore.ts**:
   ```typescript
   import { create } from 'zustand';
   import { persist, createJSONStorage } from 'zustand/middleware';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { AuthStore } from '../types/AuthState';
   import { User } from '@/domain/entities/User';

   const initialState = {
     user: null,
     isAuthenticated: false,
     isLoading: false,
     error: null,
     session: {
       accessToken: null,
       refreshToken: null,
       expiresAt: null,
     },
   };

   export const useAuthStore = create<AuthStore>()(
     persist(
       (set, get) => ({
         ...initialState,

         login: async (email: string, password: string) => {
           set({ isLoading: true, error: null });
           try {
             // TODO: Implement actual login logic with Supabase
             const mockUser: User = {
               id: '1',
               email,
               profile: {
                 age: 30,
                 weight: 70,
                 mountainExperience: 'intermediate',
                 availableTrainingDays: 3,
                 targetMountain: {
                   id: '1',
                   name: 'Mount Everest',
                   elevation: 8848,
                   difficulty: 'extreme',
                   readinessCriteria: {
                     vo2MaxMin: 50,
                     trainingLoadOptimal: 'high',
                     hrvStatusStable: true,
                     recoveryTimeMax: 48,
                   },
                 },
               },
               wearableDevices: [],
               createdAt: new Date(),
               updatedAt: new Date(),
             };

             set({
               user: mockUser,
               isAuthenticated: true,
               isLoading: false,
               session: {
                 accessToken: 'mock-token',
                 refreshToken: 'mock-refresh',
                 expiresAt: new Date(Date.now() + 3600000),
               },
             });
           } catch (error) {
             set({
               error: error instanceof Error ? error.message : 'Login failed',
               isLoading: false,
             });
           }
         },

         logout: () => {
           set(initialState);
         },

         refreshToken: async () => {
           set({ isLoading: true });
           try {
             // TODO: Implement actual token refresh logic
             set({
               session: {
                 accessToken: 'new-mock-token',
                 refreshToken: 'new-mock-refresh',
                 expiresAt: new Date(Date.now() + 3600000),
               },
               isLoading: false,
             });
           } catch (error) {
             set({
               error: error instanceof Error ? error.message : 'Token refresh failed',
               isLoading: false,
             });
           }
         },

         updateUser: (user: User) => {
           set({ user });
         },

         setLoading: (loading: boolean) => {
           set({ isLoading: loading });
         },

         setError: (error: string | null) => {
           set({ error });
         },

         clearError: () => {
           set({ error: null });
         },
       }),
       {
         name: 'auth-storage',
         storage: createJSONStorage(() => AsyncStorage),
         partialize: (state) => ({
           user: state.user,
           isAuthenticated: state.isAuthenticated,
           session: state.session,
         }),
       }
     )
   );
   ```

   **src/presentation/stores/userStore.ts**:
   ```typescript
   import { create } from 'zustand';
   import { UserState, UserActions } from '../types/UserState';
   import { User, UserProfile } from '@/domain/entities/User';

   export const useUserStore = create<UserState & UserActions>((set, get) => ({
     currentUser: null,
     profile: null,
     isLoading: false,
     error: null,

     fetchUser: async (userId: string) => {
       set({ isLoading: true, error: null });
       try {
         // TODO: Implement actual user fetching logic
         const mockUser: User = {
           id: userId,
           email: 'user@example.com',
           profile: {
             age: 30,
             weight: 70,
             mountainExperience: 'intermediate',
             availableTrainingDays: 3,
             targetMountain: {
               id: '1',
               name: 'Mount Everest',
               elevation: 8848,
               difficulty: 'extreme',
               readinessCriteria: {
                 vo2MaxMin: 50,
                 trainingLoadOptimal: 'high',
                 hrvStatusStable: true,
                 recoveryTimeMax: 48,
               },
             },
           },
           wearableDevices: [],
           createdAt: new Date(),
           updatedAt: new Date(),
         };

         set({
           currentUser: mockUser,
           profile: mockUser.profile,
           isLoading: false,
         });
       } catch (error) {
         set({
           error: error instanceof Error ? error.message : 'Failed to fetch user',
           isLoading: false,
         });
       }
     },

     updateProfile: async (profile: Partial<UserProfile>) => {
       set({ isLoading: true, error: null });
       try {
         // TODO: Implement actual profile update logic
         const currentProfile = get().profile;
         const updatedProfile = { ...currentProfile, ...profile };

         set({
           profile: updatedProfile,
           currentUser: get().currentUser
             ? { ...get().currentUser!, profile: updatedProfile }
             : null,
           isLoading: false,
         });
       } catch (error) {
         set({
           error: error instanceof Error ? error.message : 'Failed to update profile',
           isLoading: false,
         });
       }
     },

     setUser: (user: User) => {
       set({ currentUser: user, profile: user.profile });
     },

     clearUser: () => {
       set({ currentUser: null, profile: null });
     },

     setLoading: (loading: boolean) => {
       set({ isLoading: loading });
     },

     setError: (error: string | null) => {
       set({ error });
     },
   }));
   ```

4. **Create React Query Configuration**:

   **src/presentation/providers/QueryProvider.tsx**:
   ```typescript
   import React from 'react';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         cacheTime: 10 * 60 * 1000, // 10 minutes
         retry: 3,
         retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
         refetchOnWindowFocus: false,
         refetchOnReconnect: true,
       },
       mutations: {
         retry: 1,
         retryDelay: 1000,
       },
     },
   });

   interface QueryProviderProps {
     children: React.ReactNode;
   }

   export function QueryProvider({ children }: QueryProviderProps) {
     return (
       <QueryClientProvider client={queryClient}>
         {children}
         {__DEV__ && <ReactQueryDevtools initialIsOpen={false} />}
       </QueryClientProvider>
     );
   }
   ```

5. **Create Custom Hooks for React Query**:

   **src/presentation/hooks/useUser.ts**:
   ```typescript
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
   import { User } from '@/domain/entities/User';
   import { useUserStore } from '../stores/userStore';
   import { queryKeys } from '@/shared/utils/queryKeys';

   export function useUser(userId: string) {
     return useQuery({
       queryKey: queryKeys.user(userId),
       queryFn: async (): Promise<User> => {
         // TODO: Implement actual API call
         const response = await fetch(`/api/users/${userId}`);
         if (!response.ok) {
           throw new Error('Failed to fetch user');
         }
         return response.json();
       },
       enabled: !!userId,
     });
   }

   export function useUpdateUser() {
     const queryClient = useQueryClient();
     const { setUser } = useUserStore();

     return useMutation({
       mutationFn: async (user: Partial<User>): Promise<User> => {
         // TODO: Implement actual API call
         const response = await fetch(`/api/users/${user.id}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(user),
         });
         if (!response.ok) {
           throw new Error('Failed to update user');
         }
         return response.json();
       },
       onSuccess: (updatedUser) => {
         setUser(updatedUser);
         queryClient.invalidateQueries({ queryKey: queryKeys.user(updatedUser.id) });
       },
     });
   }
   ```

6. **Create Query Keys Utility**:

   **src/shared/utils/queryKeys.ts**:
   ```typescript
   export const queryKeys = {
     user: (id: string) => ['user', id] as const,
     users: () => ['users'] as const,
     training: (id: string) => ['training', id] as const,
     trainings: (userId: string) => ['trainings', userId] as const,
     readiness: (userId: string, mountainId: string) =>
       ['readiness', userId, mountainId] as const,
     wearableData: (userId: string) => ['wearable-data', userId] as const,
     mountains: () => ['mountains'] as const,
     mountain: (id: string) => ['mountain', id] as const,
   } as const;
   ```

7. **Create Storage Utility**:

   **src/shared/utils/storage.ts**:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';

   export class StorageService {
     static async get<T>(key: string): Promise<T | null> {
       try {
         const value = await AsyncStorage.getItem(key);
         return value ? JSON.parse(value) : null;
       } catch (error) {
         console.error('Error reading from storage:', error);
         return null;
       }
     }

     static async set<T>(key: string, value: T): Promise<void> {
       try {
         await AsyncStorage.setItem(key, JSON.stringify(value));
       } catch (error) {
         console.error('Error writing to storage:', error);
       }
     }

     static async remove(key: string): Promise<void> {
       try {
         await AsyncStorage.removeItem(key);
       } catch (error) {
         console.error('Error removing from storage:', error);
       }
     }

     static async clear(): Promise<void> {
       try {
         await AsyncStorage.clear();
       } catch (error) {
         console.error('Error clearing storage:', error);
       }
     }
   }
   ```

8. **Update App.tsx to Include Providers**:

   **App.tsx**:
   ```typescript
   import React from 'react';
   import { StatusBar } from 'expo-status-bar';
   import { StyleSheet, Text, View } from 'react-native';
   import { QueryProvider } from '@/presentation/providers/QueryProvider';
   import { useAuthStore } from '@/presentation/stores/authStore';

   function AppContent() {
     const { isAuthenticated, user } = useAuthStore();

     return (
       <View style={styles.container}>
         <Text>Mountain Climber Training App</Text>
         {isAuthenticated && user && (
           <Text>Welcome, {user.email}!</Text>
         )}
         <StatusBar style="auto" />
       </View>
     );
   }

   export default function App() {
     return (
       <QueryProvider>
         <AppContent />
       </QueryProvider>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#fff',
       alignItems: 'center',
       justifyContent: 'center',
     },
   });
   ```

**Key Implementation Details**:
- **Design Patterns**: Observer pattern (Zustand), Repository pattern (React Query)
- **Error Handling**: Comprehensive error handling in stores and queries
- **Data Validation**: TypeScript types ensure data integrity
- **Performance Considerations**: Query caching, optimistic updates, background refetching

### Testing Requirements

**Unit Tests**:
- [ ] Zustand stores state updates correctly
- [ ] React Query hooks fetch data properly
- [ ] Storage service handles errors gracefully
- [ ] Query keys are properly structured

**Integration Tests**:
- [ ] Store persistence works with AsyncStorage
- [ ] Query invalidation triggers refetches
- [ ] Error states are properly handled

**Manual Testing Steps**:
1. Verify Zustand stores persist data across app restarts
2. Test React Query caching and background updates
3. Verify error handling in stores and queries
4. Test loading states display correctly

### Code Quality Standards

**Code Requirements**:
- [ ] All stores follow Zustand best practices
- [ ] All queries use proper query keys
- [ ] Error handling is comprehensive
- [ ] TypeScript types are strict and accurate
- [ ] Storage operations are wrapped in try-catch

**Security Requirements**:
- [ ] Sensitive data is not stored in plain text
- [ ] Token refresh logic is secure
- [ ] Storage keys are namespaced properly

### Definition of Done
- [ ] Zustand stores configured and working
- [ ] React Query setup complete with proper configuration
- [ ] Custom hooks created for data fetching
- [ ] State persistence working with AsyncStorage
- [ ] Error handling implemented throughout
- [ ] TypeScript types defined for all state
- [ ] Integration with hexagonal architecture complete

### Potential Challenges
**Known Risks**:
- Zustand persistence conflicts - Mitigation: Proper partialize configuration
- React Query cache invalidation complexity - Mitigation: Clear query key structure
- AsyncStorage performance issues - Mitigation: Implement storage limits

**Research Required**:
- Zustand persistence best practices
- React Query optimization strategies
- AsyncStorage performance optimization

### Additional Resources
**Reference Materials**:
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)

**Related Code**:
- [Zustand with TypeScript](https://github.com/pmndrs/zustand#typescript)
- [React Query with TypeScript](https://tanstack.com/query/latest/docs/typescript) 