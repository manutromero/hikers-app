# Sub-Task 1.5: Navigation Structure Setup

### Objective
Configure React Navigation with stack and tab navigators, implementing authentication flow and main app navigation structure for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 1: Project Setup and Development Environment](../main-tasks-mountain-climber-training-app.md#task-1-project-setup-and-development-environment)
**Context**: This sub-task establishes the navigation foundation that will handle authentication flow and main app navigation, integrating with the state management system.

### Time Estimation
**Estimated Time**: 2 hours
**Complexity**: Medium
**Developer Type**: Frontend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-1-1 (Expo Project Initialization) completed
- [ ] ST-MT-1-2 (TypeScript and ESLint Configuration) completed
- [ ] ST-MT-1-3 (Hexagonal Architecture Setup) completed
- [ ] ST-MT-1-4 (State Management Configuration) completed

**Outputs Needed By**:
- ST-MT-1-6 (Environment Configuration)
- ST-MT-1-7 (CI/CD Pipeline Setup)
- All future screen development

### Acceptance Criteria
- [ ] React Navigation installed and configured
- [ ] Authentication flow with stack navigator implemented
- [ ] Main app navigation with tab navigator implemented
- [ ] Navigation types defined with TypeScript
- [ ] Deep linking configuration set up
- [ ] Navigation state integrated with authentication store
- [ ] Basic placeholder screens created
- [ ] Navigation guards implemented

### Technical Implementation

**Architecture Context**:
This sub-task implements the presentation layer navigation that connects with the application layer state management and follows the hexagonal architecture principles.

**Files to Create/Modify**:
```
mountain-climber-training-app/
├── src/
│   ├── presentation/
│   │   ├── navigation/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainNavigator.tsx
│   │   │   └── NavigationService.ts
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── index.ts
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   └── ForgotPasswordScreen.tsx
│   │   │   ├── main/
│   │   │   │   ├── index.ts
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── TrainingScreen.tsx
│   │   │   │   ├── ReadinessScreen.tsx
│   │   │   │   ├── ProfileScreen.tsx
│   │   │   │   └── SettingsScreen.tsx
│   │   │   ├── onboarding/
│   │   │   │   ├── index.ts
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   └── SurveyScreen.tsx
│   │   │   └── index.ts
│   │   └── components/
│   │       └── navigation/
│   │           ├── index.ts
│   │           ├── TabBarIcon.tsx
│   │           └── CustomTabBar.tsx
```

**Step-by-Step Implementation**:

1. **Install Required Dependencies**:
   ```bash
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   npm install react-native-screens react-native-safe-area-context
   npm install @react-navigation/native-stack
   expo install expo-linking
   ```

2. **Create Navigation Types**:

   **src/presentation/navigation/types.ts**:
   ```typescript
   import { NavigatorScreenParams } from '@react-navigation/native';

   export type AuthStackParamList = {
     Login: undefined;
     Register: undefined;
     ForgotPassword: undefined;
   };

   export type MainTabParamList = {
     Dashboard: undefined;
     Training: undefined;
     Readiness: undefined;
     Profile: undefined;
     Settings: undefined;
   };

   export type OnboardingStackParamList = {
     Welcome: undefined;
     Survey: undefined;
   };

   export type RootStackParamList = {
     Auth: NavigatorScreenParams<AuthStackParamList>;
     Main: NavigatorScreenParams<MainTabParamList>;
     Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
   };

   declare global {
     namespace ReactNavigation {
       interface RootParamList extends RootStackParamList {}
     }
   }
   ```

3. **Create Authentication Navigator**:

   **src/presentation/navigation/AuthNavigator.tsx**:
   ```typescript
   import React from 'react';
   import { createNativeStackNavigator } from '@react-navigation/native-stack';
   import { AuthStackParamList } from './types';
   import { LoginScreen } from '../screens/auth/LoginScreen';
   import { RegisterScreen } from '../screens/auth/RegisterScreen';
   import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

   const Stack = createNativeStackNavigator<AuthStackParamList>();

   export function AuthNavigator() {
     return (
       <Stack.Navigator
         screenOptions={{
           headerShown: false,
           animation: 'slide_from_right',
         }}
       >
         <Stack.Screen name="Login" component={LoginScreen} />
         <Stack.Screen name="Register" component={RegisterScreen} />
         <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
       </Stack.Navigator>
     );
   }
   ```

4. **Create Main Tab Navigator**:

   **src/presentation/navigation/MainNavigator.tsx**:
   ```typescript
   import React from 'react';
   import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
   import { MainTabParamList } from './types';
   import { DashboardScreen } from '../screens/main/DashboardScreen';
   import { TrainingScreen } from '../screens/main/TrainingScreen';
   import { ReadinessScreen } from '../screens/main/ReadinessScreen';
   import { ProfileScreen } from '../screens/main/ProfileScreen';
   import { SettingsScreen } from '../screens/main/SettingsScreen';
   import { TabBarIcon } from '../components/navigation/TabBarIcon';

   const Tab = createBottomTabNavigator<MainTabParamList>();

   export function MainNavigator() {
     return (
       <Tab.Navigator
         screenOptions={({ route }) => ({
           tabBarIcon: ({ focused, color, size }) => (
             <TabBarIcon
               routeName={route.name}
               focused={focused}
               color={color}
               size={size}
             />
           ),
           tabBarActiveTintColor: '#007AFF',
           tabBarInactiveTintColor: 'gray',
           headerShown: true,
         })}
       >
         <Tab.Screen
           name="Dashboard"
           component={DashboardScreen}
           options={{ title: 'Dashboard' }}
         />
         <Tab.Screen
           name="Training"
           component={TrainingScreen}
           options={{ title: 'Training' }}
         />
         <Tab.Screen
           name="Readiness"
           component={ReadinessScreen}
           options={{ title: 'Readiness' }}
         />
         <Tab.Screen
           name="Profile"
           component={ProfileScreen}
           options={{ title: 'Profile' }}
         />
         <Tab.Screen
           name="Settings"
           component={SettingsScreen}
           options={{ title: 'Settings' }}
         />
       </Tab.Navigator>
     );
   }
   ```

5. **Create Root App Navigator**:

   **src/presentation/navigation/AppNavigator.tsx**:
   ```typescript
   import React from 'react';
   import { NavigationContainer } from '@react-navigation/native';
   import { createNativeStackNavigator } from '@react-navigation/native-stack';
   import { RootStackParamList } from './types';
   import { AuthNavigator } from './AuthNavigator';
   import { MainNavigator } from './MainNavigator';
   import { OnboardingNavigator } from './OnboardingNavigator';
   import { useAuthStore } from '../stores/authStore';
   import { LoadingScreen } from '../screens/LoadingScreen';

   const Stack = createNativeStackNavigator<RootStackParamList>();

   export function AppNavigator() {
     const { isAuthenticated, isLoading } = useAuthStore();

     if (isLoading) {
       return <LoadingScreen />;
     }

     return (
       <NavigationContainer>
         <Stack.Navigator screenOptions={{ headerShown: false }}>
           {!isAuthenticated ? (
             <Stack.Screen name="Auth" component={AuthNavigator} />
           ) : (
             <>
               <Stack.Screen name="Main" component={MainNavigator} />
               <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
             </>
           )}
         </Stack.Navigator>
       </NavigationContainer>
     );
   }
   ```

6. **Create Navigation Service**:

   **src/presentation/navigation/NavigationService.ts**:
   ```typescript
   import { createNavigationContainerRef } from '@react-navigation/native';
   import { RootStackParamList } from './types';

   export const navigationRef = createNavigationContainerRef<RootStackParamList>();

   export function navigate(name: keyof RootStackParamList, params?: any) {
     if (navigationRef.isReady()) {
       navigationRef.navigate(name as any, params);
     }
   }

   export function goBack() {
     if (navigationRef.isReady()) {
       navigationRef.goBack();
     }
   }

   export function reset(name: keyof RootStackParamList, params?: any) {
     if (navigationRef.isReady()) {
       navigationRef.reset({
         index: 0,
         routes: [{ name: name as any, params }],
       });
     }
   }
   ```

7. **Create Placeholder Screens**:

   **src/presentation/screens/auth/LoginScreen.tsx**:
   ```typescript
   import React, { useState } from 'react';
   import {
     View,
     Text,
     TextInput,
     TouchableOpacity,
     StyleSheet,
     Alert,
   } from 'react-native';
   import { useAuthStore } from '../../stores/authStore';
   import { NativeStackScreenProps } from '@react-navigation/native-stack';
   import { AuthStackParamList } from '../../navigation/types';

   type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

   export function LoginScreen({ navigation }: Props) {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const { login, isLoading } = useAuthStore();

     const handleLogin = async () => {
       if (!email || !password) {
         Alert.alert('Error', 'Please fill in all fields');
         return;
       }

       try {
         await login(email, password);
       } catch (error) {
         Alert.alert('Error', 'Login failed');
       }
     };

     return (
       <View style={styles.container}>
         <Text style={styles.title}>Mountain Climber Training</Text>
         <Text style={styles.subtitle}>Sign in to continue</Text>

         <TextInput
           style={styles.input}
           placeholder="Email"
           value={email}
           onChangeText={setEmail}
           keyboardType="email-address"
           autoCapitalize="none"
         />

         <TextInput
           style={styles.input}
           placeholder="Password"
           value={password}
           onChangeText={setPassword}
           secureTextEntry
         />

         <TouchableOpacity
           style={styles.button}
           onPress={handleLogin}
           disabled={isLoading}
         >
           <Text style={styles.buttonText}>
             {isLoading ? 'Signing in...' : 'Sign In'}
           </Text>
         </TouchableOpacity>

         <TouchableOpacity
           onPress={() => navigation.navigate('Register')}
           style={styles.linkButton}
         >
           <Text style={styles.linkText}>Don't have an account? Sign up</Text>
         </TouchableOpacity>

         <TouchableOpacity
           onPress={() => navigation.navigate('ForgotPassword')}
           style={styles.linkButton}
         >
           <Text style={styles.linkText}>Forgot password?</Text>
         </TouchableOpacity>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       padding: 20,
       backgroundColor: '#fff',
     },
     title: {
       fontSize: 24,
       fontWeight: 'bold',
       textAlign: 'center',
       marginBottom: 10,
     },
     subtitle: {
       fontSize: 16,
       textAlign: 'center',
       marginBottom: 30,
       color: '#666',
     },
     input: {
       borderWidth: 1,
       borderColor: '#ddd',
       borderRadius: 8,
       padding: 15,
       marginBottom: 15,
       fontSize: 16,
     },
     button: {
       backgroundColor: '#007AFF',
       padding: 15,
       borderRadius: 8,
       marginBottom: 15,
     },
     buttonText: {
       color: '#fff',
       textAlign: 'center',
       fontSize: 16,
       fontWeight: 'bold',
     },
     linkButton: {
       padding: 10,
     },
     linkText: {
       color: '#007AFF',
       textAlign: 'center',
       fontSize: 14,
     },
   });
   ```

8. **Create Tab Bar Icon Component**:

   **src/presentation/components/navigation/TabBarIcon.tsx**:
   ```typescript
   import React from 'react';
   import { Ionicons } from '@expo/vector-icons';
   import { MainTabParamList } from '../../navigation/types';

   interface TabBarIconProps {
     routeName: keyof MainTabParamList;
     focused: boolean;
     color: string;
     size: number;
   }

   export function TabBarIcon({ routeName, focused, color, size }: TabBarIconProps) {
     const getIconName = (routeName: keyof MainTabParamList, focused: boolean) => {
       switch (routeName) {
         case 'Dashboard':
           return focused ? 'home' : 'home-outline';
         case 'Training':
           return focused ? 'fitness' : 'fitness-outline';
         case 'Readiness':
           return focused ? 'trending-up' : 'trending-up-outline';
         case 'Profile':
           return focused ? 'person' : 'person-outline';
         case 'Settings':
           return focused ? 'settings' : 'settings-outline';
         default:
           return 'help-outline';
       }
     };

     return (
       <Ionicons
         name={getIconName(routeName, focused) as any}
         size={size}
         color={color}
       />
     );
   }
   ```

9. **Create Loading Screen**:

   **src/presentation/screens/LoadingScreen.tsx**:
   ```typescript
   import React from 'react';
   import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

   export function LoadingScreen() {
     return (
       <View style={styles.container}>
         <ActivityIndicator size="large" color="#007AFF" />
         <Text style={styles.text}>Loading...</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: '#fff',
     },
     text: {
       marginTop: 10,
       fontSize: 16,
       color: '#666',
     },
   });
   ```

10. **Update App.tsx with Navigation**:

    **App.tsx**:
    ```typescript
    import React from 'react';
    import { StatusBar } from 'expo-status-bar';
    import { QueryProvider } from '@/presentation/providers/QueryProvider';
    import { AppNavigator } from '@/presentation/navigation/AppNavigator';

    export default function App() {
      return (
        <QueryProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </QueryProvider>
      );
    }
    ```

**Key Implementation Details**:
- **Design Patterns**: Navigator pattern, Observer pattern for navigation state
- **Error Handling**: Navigation error boundaries and loading states
- **Data Validation**: TypeScript navigation types ensure type safety
- **Performance Considerations**: Lazy loading of screens, navigation state optimization

### Testing Requirements

**Unit Tests**:
- [ ] Navigation types are correctly defined
- [ ] Navigation service functions work properly
- [ ] Tab bar icon component renders correctly
- [ ] Authentication flow navigation works

**Integration Tests**:
- [ ] Navigation state integrates with authentication store
- [ ] Deep linking works correctly
- [ ] Screen transitions are smooth

**Manual Testing Steps**:
1. Test authentication flow navigation
2. Verify tab navigation works correctly
3. Test deep linking functionality
4. Verify navigation state persistence

### Code Quality Standards

**Code Requirements**:
- [ ] All navigation types are properly defined
- [ ] Navigation service follows singleton pattern
- [ ] Screen components are properly typed
- [ ] Navigation guards are implemented

**Security Requirements**:
- [ ] Authentication screens are protected
- [ ] Navigation state is properly validated
- [ ] Deep linking is secure

### Definition of Done
- [ ] React Navigation configured and working
- [ ] Authentication flow implemented
- [ ] Main app navigation with tabs working
- [ ] Navigation types defined with TypeScript
- [ ] Deep linking configured
- [ ] Navigation state integrated with authentication
- [ ] Placeholder screens created and functional

### Potential Challenges
**Known Risks**:
- Navigation state conflicts - Mitigation: Proper state management integration
- Deep linking complexity - Mitigation: Clear URL structure
- TypeScript navigation types - Mitigation: Proper type definitions

**Research Required**:
- React Navigation best practices
- Deep linking implementation strategies
- Navigation state management patterns

### Additional Resources
**Reference Materials**:
- [React Navigation Documentation](https://reactnavigation.org/)
- [TypeScript Navigation Guide](https://reactnavigation.org/docs/typescript/)
- [Deep Linking Guide](https://reactnavigation.org/docs/deep-linking/)

**Related Code**:
- [React Navigation TypeScript Example](https://github.com/react-navigation/react-navigation/tree/main/packages/native/src/types.tsx)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/) 