## Sub-Task MT-3.7: Authentication UI Components

### Objective
Implement comprehensive authentication UI components including login screens, profile screens, and authentication flow components for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 3 - Authentication System Implementation](../main-tasks-mountain-climber-training-app.md#task-3-authentication-system-implementation)
**Context**: This implements the presentation layer of the authentication system, providing user-friendly interfaces for authentication flows and profile management.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Frontend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-3-1 (Supabase Auth Configuration and Setup)
- [ ] ST-MT-3-2 (OAuth Provider Integration - Google)
- [ ] ST-MT-3-3 (OAuth Provider Integration - Apple)
- [ ] ST-MT-3-4 (Authentication State Management)
- [ ] ST-MT-3-5 (JWT Token Handling and Refresh Logic)
- [ ] ST-MT-3-6 (User Profile Management)
- [ ] React Native environment setup

**Outputs Needed By**:
- Task 4 (Onboarding Survey System)

### Acceptance Criteria
- [ ] Login screen with OAuth buttons implemented
- [ ] User profile screen implemented
- [ ] Authentication loading states implemented
- [ ] Error handling and user feedback implemented
- [ ] Responsive design for all screen sizes
- [ ] Accessibility features implemented
- [ ] UI components testing completed
- [ ] Integration with authentication system verified

### Technical Implementation

**Architecture Context**:
This sub-task implements the presentation layer of the hexagonal architecture, providing user interfaces for authentication and profile management.

**Files to Create/Modify**:
```
src/
├── auth/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── AuthLoadingScreen.tsx
│   ├── components/
│   │   ├── AuthHeader.tsx
│   │   ├── AuthFooter.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── LoadingSpinner.tsx
│   └── navigation/
│       └── AuthNavigator.tsx
├── types/
│   └── auth.types.ts
└── utils/
    └── uiUtils.ts
```

**Step-by-Step Implementation**:

1. **Create Login Screen**
   ```typescript
   // src/auth/screens/LoginScreen.tsx
   
   import React, { useState, useEffect } from 'react';
   import {
     View,
     Text,
     StyleSheet,
     SafeAreaView,
     ScrollView,
     Alert,
     Dimensions,
   } from 'react-native';
   import { LinearGradient } from 'expo-linear-gradient';
   import { StatusBar } from 'expo-status-bar';
   import { useAuth } from '../hooks/useAuth';
   import { GoogleSignInButton } from '../components/GoogleSignInButton';
   import { AppleSignInButton } from '../components/AppleSignInButton';
   import { AuthHeader } from '../components/AuthHeader';
   import { AuthFooter } from '../components/AuthFooter';
   import { ErrorMessage } from '../components/ErrorMessage';
   import { LoadingSpinner } from '../components/LoadingSpinner';
   
   const { width, height } = Dimensions.get('window');
   
   export const LoginScreen: React.FC = () => {
     const { signIn, isLoading, error, clearError } = useAuth();
     const [isSigningIn, setIsSigningIn] = useState(false);
   
     const handleSignIn = async (provider: 'google' | 'apple') => {
       if (isSigningIn) return;
   
       setIsSigningIn(true);
       clearError();
   
       try {
         await signIn(provider);
       } catch (err) {
         const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
         Alert.alert('Authentication Error', errorMessage);
       } finally {
         setIsSigningIn(false);
       }
     };
   
     const handleGoogleSignIn = () => handleSignIn('google');
     const handleAppleSignIn = () => handleSignIn('apple');
   
     if (isLoading) {
       return <LoadingSpinner message="Initializing..." />;
     }
   
     return (
       <SafeAreaView style={styles.container}>
         <StatusBar style="light" />
         <LinearGradient
           colors={['#1e3c72', '#2a5298']}
           style={styles.gradient}
         >
           <ScrollView
             contentContainerStyle={styles.scrollContent}
             showsVerticalScrollIndicator={false}
           >
             <AuthHeader
               title="Welcome to Hikers"
               subtitle="Your mountain climbing training companion"
             />
   
             <View style={styles.content}>
               <View style={styles.logoContainer}>
                 <Text style={styles.logo}>🏔️</Text>
                 <Text style={styles.appName}>Hikers</Text>
                 <Text style={styles.tagline}>
                   Train smarter, climb higher
                 </Text>
               </View>
   
               <View style={styles.authContainer}>
                 <Text style={styles.authTitle}>Sign in to continue</Text>
                 <Text style={styles.authSubtitle}>
                   Choose your preferred sign-in method
                 </Text>
   
                 {error && (
                   <ErrorMessage
                     message={error}
                     onDismiss={clearError}
                   />
                 )}
   
                 <View style={styles.buttonContainer}>
                   <GoogleSignInButton
                     onSuccess={handleGoogleSignIn}
                     onError={(error) => {
                       Alert.alert('Google Sign-In Error', error.message);
                     }}
                     disabled={isSigningIn}
                   />
   
                   <AppleSignInButton
                     onSuccess={handleAppleSignIn}
                     onError={(error) => {
                       Alert.alert('Apple Sign-In Error', error.message);
                     }}
                     disabled={isSigningIn}
                   />
                 </View>
   
                 {isSigningIn && (
                   <View style={styles.loadingContainer}>
                     <LoadingSpinner message="Signing you in..." />
                   </View>
                 )}
               </View>
   
               <View style={styles.infoContainer}>
                 <Text style={styles.infoTitle}>Why sign in?</Text>
                 <View style={styles.infoItems}>
                   <View style={styles.infoItem}>
                     <Text style={styles.infoIcon}>🎯</Text>
                     <Text style={styles.infoText}>
                       Personalized training plans
                     </Text>
                   </View>
                   <View style={styles.infoItem}>
                     <Text style={styles.infoIcon}>📊</Text>
                     <Text style={styles.infoText}>
                       Track your progress
                     </Text>
                   </View>
                   <View style={styles.infoItem}>
                     <Text style={styles.infoIcon}>🔒</Text>
                     <Text style={styles.infoText}>
                       Secure data storage
                     </Text>
                   </View>
                 </View>
               </View>
             </View>
   
             <AuthFooter />
           </ScrollView>
         </LinearGradient>
       </SafeAreaView>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       flex: 1,
     },
     gradient: {
       flex: 1,
     },
     scrollContent: {
       flexGrow: 1,
       paddingHorizontal: 20,
     },
     content: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       paddingVertical: 40,
     },
     logoContainer: {
       alignItems: 'center',
       marginBottom: 60,
     },
     logo: {
       fontSize: 80,
       marginBottom: 16,
     },
     appName: {
       fontSize: 32,
       fontWeight: 'bold',
       color: '#ffffff',
       marginBottom: 8,
     },
     tagline: {
       fontSize: 16,
       color: '#e0e0e0',
       textAlign: 'center',
     },
     authContainer: {
       width: '100%',
       maxWidth: 400,
       marginBottom: 40,
     },
     authTitle: {
       fontSize: 24,
       fontWeight: 'bold',
       color: '#ffffff',
       textAlign: 'center',
       marginBottom: 8,
     },
     authSubtitle: {
       fontSize: 16,
       color: '#e0e0e0',
       textAlign: 'center',
       marginBottom: 24,
     },
     buttonContainer: {
       gap: 16,
       marginBottom: 24,
     },
     loadingContainer: {
       alignItems: 'center',
       marginTop: 16,
     },
     infoContainer: {
       width: '100%',
       maxWidth: 400,
     },
     infoTitle: {
       fontSize: 20,
       fontWeight: 'bold',
       color: '#ffffff',
       textAlign: 'center',
       marginBottom: 20,
     },
     infoItems: {
       gap: 16,
     },
     infoItem: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: 'rgba(255, 255, 255, 0.1)',
       padding: 16,
       borderRadius: 12,
     },
     infoIcon: {
       fontSize: 24,
       marginRight: 12,
     },
     infoText: {
       fontSize: 16,
       color: '#ffffff',
       flex: 1,
     },
   });
   ```

2. **Create Profile Screen**
   ```typescript
   // src/auth/screens/ProfileScreen.tsx
   
   import React, { useState } from 'react';
   import {
     View,
     Text,
     StyleSheet,
     SafeAreaView,
     ScrollView,
     TouchableOpacity,
     Alert,
     Dimensions,
   } from 'react-native';
   import { Ionicons } from '@expo/vector-icons';
   import { useAuth } from '../hooks/useAuth';
   import { useProfile } from '../hooks/useProfile';
   import { ProfileForm } from '../components/ProfileForm';
   import { ProfileImagePicker } from '../components/ProfileImagePicker';
   import { LoadingSpinner } from '../components/LoadingSpinner';
   import { ErrorMessage } from '../components/ErrorMessage';
   
   const { width } = Dimensions.get('window');
   
   export const ProfileScreen: React.FC = () => {
     const { user, signOut } = useAuth();
     const { profile, isLoading, error, updateProfile, syncProfile } = useProfile();
     const [isEditing, setIsEditing] = useState(false);
     const [isUpdatingImage, setIsUpdatingImage] = useState(false);
   
     const handleSignOut = () => {
       Alert.alert(
         'Sign Out',
         'Are you sure you want to sign out?',
         [
           { text: 'Cancel', style: 'cancel' },
           { text: 'Sign Out', style: 'destructive', onPress: signOut },
         ]
       );
     };
   
     const handleProfileSave = (updatedProfile: any) => {
       setIsEditing(false);
       Alert.alert('Success', 'Profile updated successfully');
     };
   
     const handleProfileCancel = () => {
       setIsEditing(false);
     };
   
     const handleImageUpdate = async (imageUri: string) => {
       if (!profile) return;
   
       setIsUpdatingImage(true);
   
       try {
         await updateProfile({ profileImage: imageUri });
         Alert.alert('Success', 'Profile image updated successfully');
       } catch (error) {
         Alert.alert('Error', 'Failed to update profile image');
       } finally {
         setIsUpdatingImage(false);
       }
     };
   
     const handleSyncProfile = async () => {
       try {
         await syncProfile();
         Alert.alert('Success', 'Profile synchronized successfully');
       } catch (error) {
         Alert.alert('Error', 'Failed to synchronize profile');
       }
     };
   
     if (isLoading) {
       return <LoadingSpinner message="Loading profile..." />;
     }
   
     if (!user) {
       return (
         <SafeAreaView style={styles.container}>
           <View style={styles.errorContainer}>
             <Text style={styles.errorText}>User not authenticated</Text>
           </View>
         </SafeAreaView>
       );
     }
   
     return (
       <SafeAreaView style={styles.container}>
         <ScrollView style={styles.scrollView}>
           <View style={styles.header}>
             <Text style={styles.title}>Profile</Text>
             <TouchableOpacity
               style={styles.syncButton}
               onPress={handleSyncProfile}
             >
               <Ionicons name="refresh" size={20} color="#007AFF" />
             </TouchableOpacity>
           </View>
   
           {error && (
             <ErrorMessage
               message={error}
               onDismiss={() => {}}
             />
           )}
   
           <View style={styles.content}>
             {isEditing ? (
               <ProfileForm
                 initialData={profile}
                 onSave={handleProfileSave}
                 onCancel={handleProfileCancel}
               />
             ) : (
               <View style={styles.profileInfo}>
                 <View style={styles.imageSection}>
                   <ProfileImagePicker
                     currentImage={profile?.profileImage}
                     onImageSelected={handleImageUpdate}
                     isLoading={isUpdatingImage}
                   />
                 </View>
   
                 <View style={styles.infoSection}>
                   <View style={styles.infoRow}>
                     <Text style={styles.infoLabel}>Name</Text>
                     <Text style={styles.infoValue}>
                       {profile?.firstName} {profile?.lastName}
                     </Text>
                   </View>
   
                   {profile?.email && (
                     <View style={styles.infoRow}>
                       <Text style={styles.infoLabel}>Email</Text>
                       <Text style={styles.infoValue}>{profile.email}</Text>
                     </View>
                   )}
   
                   {profile?.fitnessLevel && (
                     <View style={styles.infoRow}>
                       <Text style={styles.infoLabel}>Fitness Level</Text>
                       <Text style={styles.infoValue}>
                         {profile.fitnessLevel.charAt(0).toUpperCase() + 
                          profile.fitnessLevel.slice(1)}
                       </Text>
                     </View>
                   )}
   
                   {profile?.climbingExperience && (
                     <View style={styles.infoRow}>
                       <Text style={styles.infoLabel}>Climbing Experience</Text>
                       <Text style={styles.infoValue}>
                         {profile.climbingExperience.charAt(0).toUpperCase() + 
                          profile.climbingExperience.slice(1)}
                       </Text>
                     </View>
                   )}
   
                   {profile?.preferredClimbingType && (
                     <View style={styles.infoRow}>
                       <Text style={styles.infoLabel}>Preferred Type</Text>
                       <Text style={styles.infoValue}>
                         {profile.preferredClimbingType.charAt(0).toUpperCase() + 
                          profile.preferredClimbingType.slice(1)}
                       </Text>
                     </View>
                   )}
   
                   {profile?.height && (
                     <View style={styles.infoRow}>
                       <Text style={styles.infoLabel}>Height</Text>
                       <Text style={styles.infoValue}>{profile.height} cm</Text>
                     </View>
                   )}
   
                   {profile?.weight && (
                     <View style={styles.infoRow}>
                       <Text style={styles.infoLabel}>Weight</Text>
                       <Text style={styles.infoValue}>{profile.weight} kg</Text>
                     </View>
                   )}
                 </View>
   
                 <View style={styles.actionsSection}>
                   <TouchableOpacity
                     style={styles.editButton}
                     onPress={() => setIsEditing(true)}
                   >
                     <Ionicons name="create-outline" size={20} color="#007AFF" />
                     <Text style={styles.editButtonText}>Edit Profile</Text>
                   </TouchableOpacity>
   
                   <TouchableOpacity
                     style={styles.signOutButton}
                     onPress={handleSignOut}
                   >
                     <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                     <Text style={styles.signOutButtonText}>Sign Out</Text>
                   </TouchableOpacity>
                 </View>
               </View>
             )}
           </View>
         </ScrollView>
       </SafeAreaView>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#f8f9fa',
     },
     scrollView: {
       flex: 1,
     },
     header: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingHorizontal: 20,
       paddingVertical: 16,
       backgroundColor: '#ffffff',
       borderBottomWidth: 1,
       borderBottomColor: '#e0e0e0',
     },
     title: {
       fontSize: 24,
       fontWeight: 'bold',
       color: '#333333',
     },
     syncButton: {
       padding: 8,
     },
     content: {
       flex: 1,
       padding: 20,
     },
     profileInfo: {
       backgroundColor: '#ffffff',
       borderRadius: 12,
       padding: 20,
       shadowColor: '#000',
       shadowOffset: {
         width: 0,
         height: 2,
       },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 3,
     },
     imageSection: {
       alignItems: 'center',
       marginBottom: 24,
     },
     infoSection: {
       marginBottom: 24,
     },
     infoRow: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingVertical: 12,
       borderBottomWidth: 1,
       borderBottomColor: '#f0f0f0',
     },
     infoLabel: {
       fontSize: 16,
       fontWeight: '600',
       color: '#666666',
     },
     infoValue: {
       fontSize: 16,
       color: '#333333',
       flex: 1,
       textAlign: 'right',
     },
     actionsSection: {
       gap: 12,
     },
     editButton: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'center',
       backgroundColor: '#f0f8ff',
       padding: 16,
       borderRadius: 8,
       borderWidth: 1,
       borderColor: '#007AFF',
     },
     editButtonText: {
       marginLeft: 8,
       fontSize: 16,
       fontWeight: '600',
       color: '#007AFF',
     },
     signOutButton: {
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'center',
       backgroundColor: '#fff5f5',
       padding: 16,
       borderRadius: 8,
       borderWidth: 1,
       borderColor: '#FF3B30',
     },
     signOutButtonText: {
       marginLeft: 8,
       fontSize: 16,
       fontWeight: '600',
       color: '#FF3B30',
     },
     errorContainer: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
     },
     errorText: {
       fontSize: 16,
       color: '#666666',
     },
   });
   ```

3. **Create Auth Loading Screen**
   ```typescript
   // src/auth/screens/AuthLoadingScreen.tsx
   
   import React from 'react';
   import {
     View,
     Text,
     StyleSheet,
     SafeAreaView,
     Dimensions,
   } from 'react-native';
   import { LinearGradient } from 'expo-linear-gradient';
   import { LoadingSpinner } from '../components/LoadingSpinner';
   
   const { width, height } = Dimensions.get('window');
   
   interface AuthLoadingScreenProps {
     message?: string;
   }
   
   export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
     message = 'Loading...',
   }) => {
     return (
       <SafeAreaView style={styles.container}>
         <LinearGradient
           colors={['#1e3c72', '#2a5298']}
           style={styles.gradient}
         >
           <View style={styles.content}>
             <View style={styles.logoContainer}>
               <Text style={styles.logo}>🏔️</Text>
               <Text style={styles.appName}>Hikers</Text>
             </View>
   
             <View style={styles.loadingContainer}>
               <LoadingSpinner message={message} />
             </View>
   
             <View style={styles.footer}>
               <Text style={styles.footerText}>
                 Your mountain climbing training companion
               </Text>
             </View>
           </View>
         </LinearGradient>
       </SafeAreaView>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       flex: 1,
     },
     gradient: {
       flex: 1,
       justifyContent: 'center',
      alignItems: 'center',
     },
     content: {
       flex: 1,
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingVertical: 60,
     },
     logoContainer: {
       alignItems: 'center',
     },
     logo: {
       fontSize: 80,
       marginBottom: 16,
     },
     appName: {
       fontSize: 32,
       fontWeight: 'bold',
       color: '#ffffff',
     },
     loadingContainer: {
       alignItems: 'center',
     },
     footer: {
       alignItems: 'center',
     },
     footerText: {
       fontSize: 16,
       color: '#e0e0e0',
       textAlign: 'center',
     },
   });
   ```

4. **Create Auth Header Component**
   ```typescript
   // src/auth/components/AuthHeader.tsx
   
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';
   
   interface AuthHeaderProps {
     title: string;
     subtitle?: string;
   }
   
   export const AuthHeader: React.FC<AuthHeaderProps> = ({
     title,
     subtitle,
   }) => {
     return (
       <View style={styles.container}>
         <Text style={styles.title}>{title}</Text>
         {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
       </View>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       alignItems: 'center',
       paddingVertical: 20,
     },
     title: {
       fontSize: 28,
       fontWeight: 'bold',
       color: '#ffffff',
       textAlign: 'center',
       marginBottom: 8,
     },
     subtitle: {
       fontSize: 16,
       color: '#e0e0e0',
       textAlign: 'center',
       lineHeight: 22,
     },
   });
   ```

5. **Create Auth Footer Component**
   ```typescript
   // src/auth/components/AuthFooter.tsx
   
   import React from 'react';
   import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
   
   interface AuthFooterProps {
     onPrivacyPolicy?: () => void;
     onTermsOfService?: () => void;
   }
   
   export const AuthFooter: React.FC<AuthFooterProps> = ({
     onPrivacyPolicy,
     onTermsOfService,
   }) => {
     return (
       <View style={styles.container}>
         <Text style={styles.text}>
           By signing in, you agree to our{' '}
           {onTermsOfService && (
             <Text style={styles.link} onPress={onTermsOfService}>
               Terms of Service
             </Text>
           )}
           {' '}and{' '}
           {onPrivacyPolicy && (
             <Text style={styles.link} onPress={onPrivacyPolicy}>
               Privacy Policy
             </Text>
           )}
         </Text>
       </View>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       paddingVertical: 20,
       paddingHorizontal: 20,
     },
     text: {
       fontSize: 12,
       color: '#e0e0e0',
       textAlign: 'center',
       lineHeight: 16,
     },
     link: {
       color: '#ffffff',
       textDecorationLine: 'underline',
     },
   });
   ```

6. **Create Error Message Component**
   ```typescript
   // src/auth/components/ErrorMessage.tsx
   
   import React from 'react';
   import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
   import { Ionicons } from '@expo/vector-icons';
   
   interface ErrorMessageProps {
     message: string;
     onDismiss?: () => void;
   }
   
   export const ErrorMessage: React.FC<ErrorMessageProps> = ({
     message,
     onDismiss,
   }) => {
     return (
       <View style={styles.container}>
         <View style={styles.content}>
           <Ionicons name="alert-circle" size={20} color="#ffffff" />
           <Text style={styles.message}>{message}</Text>
         </View>
         {onDismiss && (
           <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
             <Ionicons name="close" size={20} color="#ffffff" />
           </TouchableOpacity>
         )}
       </View>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: '#FF3B30',
       padding: 12,
       borderRadius: 8,
       marginBottom: 16,
     },
     content: {
       flex: 1,
       flexDirection: 'row',
       alignItems: 'center',
     },
     message: {
       flex: 1,
       fontSize: 14,
       color: '#ffffff',
       marginLeft: 8,
     },
     dismissButton: {
       padding: 4,
     },
   });
   ```

7. **Create Loading Spinner Component**
   ```typescript
   // src/auth/components/LoadingSpinner.tsx
   
   import React from 'react';
   import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
   
   interface LoadingSpinnerProps {
     message?: string;
     size?: 'small' | 'large';
     color?: string;
   }
   
   export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
     message,
     size = 'large',
     color = '#ffffff',
   }) => {
     return (
       <View style={styles.container}>
         <ActivityIndicator size={size} color={color} />
         {message && <Text style={styles.message}>{message}</Text>}
       </View>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       alignItems: 'center',
       justifyContent: 'center',
       padding: 20,
     },
     message: {
       marginTop: 12,
       fontSize: 16,
       color: '#ffffff',
       textAlign: 'center',
     },
   });
   ```

8. **Create Auth Navigator**
   ```typescript
   // src/auth/navigation/AuthNavigator.tsx
   
   import React from 'react';
   import { NavigationContainer } from '@react-navigation/native';
   import { createStackNavigator } from '@react-navigation/stack';
   import { LoginScreen } from '../screens/LoginScreen';
   import { ProfileScreen } from '../screens/ProfileScreen';
   import { AuthLoadingScreen } from '../screens/AuthLoadingScreen';
   import { useAuth } from '../hooks/useAuth';
   
   const Stack = createStackNavigator();
   
   export const AuthNavigator: React.FC = () => {
     const { isInitializing, isAuthenticated } = useAuth();
   
     if (isInitializing) {
       return <AuthLoadingScreen message="Initializing..." />;
     }
   
     return (
       <NavigationContainer>
         <Stack.Navigator
           screenOptions={{
             headerShown: false,
           }}
         >
           {!isAuthenticated ? (
             <Stack.Screen name="Login" component={LoginScreen} />
           ) : (
             <Stack.Screen name="Profile" component={ProfileScreen} />
           )}
         </Stack.Navigator>
       </NavigationContainer>
     );
   };
   ```

**Key Implementation Details**:
- **Design Patterns**: Component composition, Container/Presenter pattern
- **Error Handling**: Comprehensive error handling and user feedback
- **Data Validation**: Form validation and user input sanitization
- **Performance Considerations**: Efficient rendering and minimal re-renders

### Testing Requirements

**Unit Tests**:
- [ ] LoginScreen component tests
- [ ] ProfileScreen component tests
- [ ] AuthLoadingScreen component tests
- [ ] AuthHeader component tests
- [ ] ErrorMessage component tests
- [ ] LoadingSpinner component tests

**Integration Tests**:
- [ ] Authentication flow tests
- [ ] Profile management flow tests
- [ ] Navigation flow tests
- [ ] OAuth integration tests

**Manual Testing Steps**:
1. Test login screen functionality
2. Verify OAuth button interactions
3. Test profile screen display
4. Validate profile editing
5. Test error handling
6. Verify loading states
7. Test navigation flow

### Code Quality Standards

**Code Requirements**:
- [ ] Follow React Native best practices
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure accessibility compliance

**Security Requirements**:
- [ ] Secure OAuth flow
- [ ] Input validation
- [ ] Error message security
- [ ] User data protection

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] Authentication UI components working
- [ ] Login flow functional
- [ ] Profile management UI working
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- OAuth flow complexity - Mitigation: Implement comprehensive error handling
- UI responsiveness - Mitigation: Test on multiple screen sizes
- Accessibility compliance - Mitigation: Follow accessibility guidelines

**Research Required**:
- React Native UI best practices
- OAuth UI patterns
- Accessibility guidelines

### Additional Resources
**Reference Materials**:
- [React Navigation Documentation](https://reactnavigation.org/)
- [React Native UI Components](https://reactnative.dev/docs/components-and-apis)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)

**Related Code**:
- OAuth provider integrations from ST-MT-3-2 and ST-MT-3-3
- Authentication state management from ST-MT-3-4
- User profile management from ST-MT-3-6 