## Sub-Task MT-3.6: User Profile Management

### Objective
Implement comprehensive user profile management system with profile creation, editing, validation, and synchronization with the backend for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 3 - Authentication System Implementation](../main-tasks-mountain-climber-training-app.md#task-3-authentication-system-implementation)
**Context**: This implements the user profile management layer, allowing users to create, edit, and manage their profile information with proper validation and synchronization.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: Medium
**Developer Type**: Frontend/Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-3-1 (Supabase Auth Configuration and Setup)
- [ ] ST-MT-3-4 (Authentication State Management)
- [ ] ST-MT-3-5 (JWT Token Handling and Refresh Logic)
- [ ] React Native environment setup

**Outputs Needed By**:
- ST-MT-3-7 (Authentication UI Components)

### Acceptance Criteria
- [ ] User profile creation and editing functionality
- [ ] Profile data validation and error handling
- [ ] Profile synchronization with Supabase
- [ ] Profile image upload and management
- [ ] Profile completion tracking
- [ ] Offline profile management
- [ ] Profile management testing completed
- [ ] Integration with authentication system verified

### Technical Implementation

**Architecture Context**:
This sub-task implements the application layer of the hexagonal architecture, providing user profile management services and data synchronization.

**Files to Create/Modify**:
```
src/
├── auth/
│   ├── profile/
│   │   ├── ProfileManager.ts
│   │   ├── ProfileValidator.ts
│   │   └── ProfileStorage.ts
│   ├── hooks/
│   │   └── useProfile.ts
│   └── components/
│       ├── ProfileForm.tsx
│       └── ProfileImagePicker.tsx
├── types/
│   └── auth.types.ts
└── utils/
    └── profileUtils.ts
```

**Step-by-Step Implementation**:

1. **Create Profile Types**
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
   
   export interface UserProfile {
     id: string;
     email?: string;
     firstName: string;
     lastName: string;
     profileImage?: string;
     dateOfBirth?: string;
     gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
     height?: number; // in cm
     weight?: number; // in kg
     fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
     climbingExperience?: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
     preferredClimbingType?: 'bouldering' | 'sport' | 'trad' | 'alpine' | 'mixed';
     emergencyContact?: {
       name: string;
       phone: string;
       relationship: string;
     };
     medicalConditions?: string[];
     allergies?: string[];
     medications?: string[];
     createdAt: string;
     updatedAt: string;
     isProfileComplete: boolean;
   }
   
   export interface ProfileUpdateData {
     firstName?: string;
     lastName?: string;
     dateOfBirth?: string;
     gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
     height?: number;
     weight?: number;
     fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
     climbingExperience?: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
     preferredClimbingType?: 'bouldering' | 'sport' | 'trad' | 'alpine' | 'mixed';
     emergencyContact?: {
       name: string;
       phone: string;
       relationship: string;
     };
     medicalConditions?: string[];
     allergies?: string[];
     medications?: string[];
   }
   
   export interface ProfileValidationResult {
     isValid: boolean;
     errors: Record<string, string>;
     warnings: Record<string, string>;
   }
   ```

2. **Create Profile Validator**
   ```typescript
   // src/auth/profile/ProfileValidator.ts
   
   import { UserProfile, ProfileUpdateData, ProfileValidationResult } from '@/types/auth.types';
   
   export class ProfileValidator {
     private static instance: ProfileValidator;
   
     static getInstance(): ProfileValidator {
       if (!ProfileValidator.instance) {
         ProfileValidator.instance = new ProfileValidator();
       }
       return ProfileValidator.instance;
     }
   
     validateProfile(profile: Partial<UserProfile>): ProfileValidationResult {
       const errors: Record<string, string> = {};
       const warnings: Record<string, string> = {};
   
       // Required fields validation
       if (!profile.firstName?.trim()) {
         errors.firstName = 'First name is required';
       } else if (profile.firstName.length < 2) {
         errors.firstName = 'First name must be at least 2 characters';
       } else if (profile.firstName.length > 50) {
         errors.firstName = 'First name must be less than 50 characters';
       }
   
       if (!profile.lastName?.trim()) {
         errors.lastName = 'Last name is required';
       } else if (profile.lastName.length < 2) {
         errors.lastName = 'Last name must be at least 2 characters';
       } else if (profile.lastName.length > 50) {
         errors.lastName = 'Last name must be less than 50 characters';
       }
   
       // Email validation
       if (profile.email && !this.isValidEmail(profile.email)) {
         errors.email = 'Invalid email format';
       }
   
       // Date of birth validation
       if (profile.dateOfBirth) {
         const dob = new Date(profile.dateOfBirth);
         const today = new Date();
         const age = today.getFullYear() - dob.getFullYear();
   
         if (isNaN(dob.getTime())) {
           errors.dateOfBirth = 'Invalid date format';
         } else if (age < 13) {
           errors.dateOfBirth = 'You must be at least 13 years old';
         } else if (age > 100) {
           errors.dateOfBirth = 'Please enter a valid date of birth';
         }
       }
   
       // Height validation
       if (profile.height !== undefined) {
         if (profile.height < 100 || profile.height > 250) {
           errors.height = 'Height must be between 100 and 250 cm';
         }
       }
   
       // Weight validation
       if (profile.weight !== undefined) {
         if (profile.weight < 30 || profile.weight > 200) {
           errors.weight = 'Weight must be between 30 and 200 kg';
         }
       }
   
       // Emergency contact validation
       if (profile.emergencyContact) {
         const { name, phone, relationship } = profile.emergencyContact;
   
         if (!name?.trim()) {
           errors['emergencyContact.name'] = 'Emergency contact name is required';
         }
   
         if (!phone?.trim()) {
           errors['emergencyContact.phone'] = 'Emergency contact phone is required';
         } else if (!this.isValidPhone(phone)) {
           errors['emergencyContact.phone'] = 'Invalid phone number format';
         }
   
         if (!relationship?.trim()) {
           errors['emergencyContact.relationship'] = 'Emergency contact relationship is required';
         }
       }
   
       // Medical conditions validation
       if (profile.medicalConditions && profile.medicalConditions.length > 0) {
         const invalidConditions = profile.medicalConditions.filter(condition => 
           !condition.trim() || condition.length > 200
         );
   
         if (invalidConditions.length > 0) {
           errors.medicalConditions = 'Medical conditions must not be empty and less than 200 characters';
         }
       }
   
       // Warnings for incomplete profiles
       if (!profile.fitnessLevel) {
         warnings.fitnessLevel = 'Fitness level helps personalize your training';
       }
   
       if (!profile.climbingExperience) {
         warnings.climbingExperience = 'Climbing experience helps customize your program';
       }
   
       if (!profile.preferredClimbingType) {
         warnings.preferredClimbingType = 'Preferred climbing type helps tailor your experience';
       }
   
       return {
         isValid: Object.keys(errors).length === 0,
         errors,
         warnings,
       };
     }
   
     validateProfileUpdate(updateData: ProfileUpdateData): ProfileValidationResult {
       return this.validateProfile(updateData);
     }
   
     isProfileComplete(profile: Partial<UserProfile>): boolean {
       const requiredFields = ['firstName', 'lastName'];
       const recommendedFields = ['fitnessLevel', 'climbingExperience', 'emergencyContact'];
   
       const hasRequiredFields = requiredFields.every(field => 
         profile[field as keyof UserProfile] && 
         String(profile[field as keyof UserProfile]).trim().length > 0
       );
   
       const hasRecommendedFields = recommendedFields.some(field => 
         profile[field as keyof UserProfile] && 
         (Array.isArray(profile[field as keyof UserProfile]) 
           ? (profile[field as keyof UserProfile] as any[]).length > 0
           : true)
       );
   
       return hasRequiredFields && hasRecommendedFields;
     }
   
     private isValidEmail(email: string): boolean {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       return emailRegex.test(email);
     }
   
     private isValidPhone(phone: string): boolean {
       const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
       return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
     }
   
     sanitizeProfileData(data: any): Partial<UserProfile> {
       const sanitized: Partial<UserProfile> = {};
   
       if (data.firstName) {
         sanitized.firstName = data.firstName.trim();
       }
   
       if (data.lastName) {
         sanitized.lastName = data.lastName.trim();
       }
   
       if (data.email) {
         sanitized.email = data.email.trim().toLowerCase();
       }
   
       if (data.dateOfBirth) {
         sanitized.dateOfBirth = data.dateOfBirth;
       }
   
       if (data.gender) {
         sanitized.gender = data.gender;
       }
   
       if (data.height !== undefined) {
         sanitized.height = Number(data.height);
       }
   
       if (data.weight !== undefined) {
         sanitized.weight = Number(data.weight);
       }
   
       if (data.fitnessLevel) {
         sanitized.fitnessLevel = data.fitnessLevel;
       }
   
       if (data.climbingExperience) {
         sanitized.climbingExperience = data.climbingExperience;
       }
   
       if (data.preferredClimbingType) {
         sanitized.preferredClimbingType = data.preferredClimbingType;
       }
   
       if (data.emergencyContact) {
         sanitized.emergencyContact = {
           name: data.emergencyContact.name?.trim(),
           phone: data.emergencyContact.phone?.trim(),
           relationship: data.emergencyContact.relationship?.trim(),
         };
       }
   
       if (data.medicalConditions) {
         sanitized.medicalConditions = data.medicalConditions
           .filter((condition: string) => condition.trim())
           .map((condition: string) => condition.trim());
       }
   
       if (data.allergies) {
         sanitized.allergies = data.allergies
           .filter((allergy: string) => allergy.trim())
           .map((allergy: string) => allergy.trim());
       }
   
       if (data.medications) {
         sanitized.medications = data.medications
           .filter((medication: string) => medication.trim())
           .map((medication: string) => medication.trim());
       }
   
       return sanitized;
     }
   }
   ```

3. **Create Profile Storage**
   ```typescript
   // src/auth/profile/ProfileStorage.ts
   
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { UserProfile } from '@/types/auth.types';
   
   const PROFILE_STORAGE_KEY = '@hikers_app_user_profile';
   const PROFILE_CACHE_KEY = '@hikers_app_profile_cache';
   
   export class ProfileStorage {
     private static instance: ProfileStorage;
   
     static getInstance(): ProfileStorage {
       if (!ProfileStorage.instance) {
         ProfileStorage.instance = new ProfileStorage();
       }
       return ProfileStorage.instance;
     }
   
     async saveProfile(profile: UserProfile): Promise<void> {
       try {
         await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
       } catch (error) {
         console.error('Error saving profile:', error);
         throw error;
       }
     }
   
     async loadProfile(): Promise<UserProfile | null> {
       try {
         const profileData = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
         return profileData ? JSON.parse(profileData) : null;
       } catch (error) {
         console.error('Error loading profile:', error);
         return null;
       }
     }
   
     async clearProfile(): Promise<void> {
       try {
         await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
       } catch (error) {
         console.error('Error clearing profile:', error);
         throw error;
       }
     }
   
     async cacheProfile(profile: UserProfile): Promise<void> {
       try {
         const cacheData = {
           profile,
           timestamp: Date.now(),
         };
         await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
       } catch (error) {
         console.error('Error caching profile:', error);
         throw error;
       }
     }
   
     async getCachedProfile(): Promise<UserProfile | null> {
       try {
         const cacheData = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
         if (!cacheData) return null;
   
         const { profile, timestamp } = JSON.parse(cacheData);
         const cacheAge = Date.now() - timestamp;
         const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
   
         if (cacheAge > maxCacheAge) {
           await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
           return null;
         }
   
         return profile;
       } catch (error) {
         console.error('Error getting cached profile:', error);
         return null;
       }
     }
   
     async clearCache(): Promise<void> {
       try {
         await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
       } catch (error) {
         console.error('Error clearing cache:', error);
         throw error;
       }
     }
   }
   ```

4. **Create Profile Manager**
   ```typescript
   // src/auth/profile/ProfileManager.ts
   
   import { supabase } from '@/lib/supabase';
   import { UserProfile, ProfileUpdateData } from '@/types/auth.types';
   import { ProfileValidator } from './ProfileValidator';
   import { ProfileStorage } from './ProfileStorage';
   import { tokenUtils } from '../utils/tokenUtils';
   
   export interface ProfileSyncResult {
     success: boolean;
     profile?: UserProfile;
     error?: string;
     isFromCache?: boolean;
   }
   
   export class ProfileManager {
     private static instance: ProfileManager;
     private validator: ProfileValidator;
     private storage: ProfileStorage;
   
     private constructor() {
       this.validator = ProfileValidator.getInstance();
       this.storage = ProfileStorage.getInstance();
     }
   
     static getInstance(): ProfileManager {
       if (!ProfileManager.instance) {
         ProfileManager.instance = new ProfileManager();
       }
       return ProfileManager.instance;
     }
   
     async createProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
       const sanitizedData = this.validator.sanitizeProfileData(profileData);
       const validation = this.validator.validateProfile(sanitizedData);
   
       if (!validation.isValid) {
         throw new Error(`Profile validation failed: ${Object.values(validation.errors).join(', ')}`);
       }
   
       const profile: UserProfile = {
         id: profileData.id!,
         email: profileData.email,
         firstName: sanitizedData.firstName!,
         lastName: sanitizedData.lastName!,
         profileImage: sanitizedData.profileImage,
         dateOfBirth: sanitizedData.dateOfBirth,
         gender: sanitizedData.gender,
         height: sanitizedData.height,
         weight: sanitizedData.weight,
         fitnessLevel: sanitizedData.fitnessLevel,
         climbingExperience: sanitizedData.climbingExperience,
         preferredClimbingType: sanitizedData.preferredClimbingType,
         emergencyContact: sanitizedData.emergencyContact,
         medicalConditions: sanitizedData.medicalConditions || [],
         allergies: sanitizedData.allergies || [],
         medications: sanitizedData.medications || [],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         isProfileComplete: this.validator.isProfileComplete(sanitizedData),
       };
   
       // Save to Supabase
       const { data, error } = await supabase
         .from('user_profiles')
         .insert([profile])
         .select()
         .single();
   
       if (error) {
         throw new Error(`Failed to create profile: ${error.message}`);
       }
   
       // Save locally
       await this.storage.saveProfile(profile);
       await this.storage.cacheProfile(profile);
   
       return profile;
     }
   
     async updateProfile(userId: string, updateData: ProfileUpdateData): Promise<UserProfile> {
       const sanitizedData = this.validator.sanitizeProfileData(updateData);
       const validation = this.validator.validateProfileUpdate(sanitizedData);
   
       if (!validation.isValid) {
         throw new Error(`Profile validation failed: ${Object.values(validation.errors).join(', ')}`);
       }
   
       const updatePayload = {
         ...sanitizedData,
         updatedAt: new Date().toISOString(),
         isProfileComplete: this.validator.isProfileComplete(sanitizedData),
       };
   
       // Update in Supabase
       const { data, error } = await supabase
         .from('user_profiles')
         .update(updatePayload)
         .eq('id', userId)
         .select()
         .single();
   
       if (error) {
         throw new Error(`Failed to update profile: ${error.message}`);
       }
   
       // Update locally
       await this.storage.saveProfile(data);
       await this.storage.cacheProfile(data);
   
       return data;
     }
   
     async getProfile(userId: string): Promise<ProfileSyncResult> {
       try {
         // Try to get from cache first
         const cachedProfile = await this.storage.getCachedProfile();
         if (cachedProfile && cachedProfile.id === userId) {
           return { success: true, profile: cachedProfile, isFromCache: true };
         }
   
         // Get from local storage
         const localProfile = await this.storage.loadProfile();
         if (localProfile && localProfile.id === userId) {
           return { success: true, profile: localProfile, isFromCache: false };
         }
   
         // Get from Supabase
         const { data, error } = await supabase
           .from('user_profiles')
           .select('*')
           .eq('id', userId)
           .single();
   
         if (error) {
           throw new Error(`Failed to fetch profile: ${error.message}`);
         }
   
         if (data) {
           await this.storage.saveProfile(data);
           await this.storage.cacheProfile(data);
           return { success: true, profile: data, isFromCache: false };
         }
   
         return { success: false, error: 'Profile not found' };
       } catch (error) {
         console.error('Error getting profile:', error);
         return { 
           success: false, 
           error: error instanceof Error ? error.message : 'Failed to get profile' 
         };
       }
     }
   
     async syncProfile(userId: string): Promise<ProfileSyncResult> {
       try {
         const { data, error } = await supabase
           .from('user_profiles')
           .select('*')
           .eq('id', userId)
           .single();
   
         if (error) {
           throw new Error(`Failed to sync profile: ${error.message}`);
         }
   
         if (data) {
           await this.storage.saveProfile(data);
           await this.storage.cacheProfile(data);
           return { success: true, profile: data, isFromCache: false };
         }
   
         return { success: false, error: 'Profile not found' };
       } catch (error) {
         console.error('Error syncing profile:', error);
         return { 
           success: false, 
           error: error instanceof Error ? error.message : 'Failed to sync profile' 
         };
       }
     }
   
     async deleteProfile(userId: string): Promise<void> {
       try {
         const { error } = await supabase
           .from('user_profiles')
           .delete()
           .eq('id', userId);
   
         if (error) {
           throw new Error(`Failed to delete profile: ${error.message}`);
         }
   
         await this.storage.clearProfile();
         await this.storage.clearCache();
       } catch (error) {
         console.error('Error deleting profile:', error);
         throw error;
       }
     }
   
     async uploadProfileImage(userId: string, imageUri: string): Promise<string> {
       try {
         const fileName = `profile-${userId}-${Date.now()}.jpg`;
         const filePath = `profiles/${fileName}`;
   
         const { data, error } = await supabase.storage
           .from('user-images')
           .upload(filePath, {
             uri: imageUri,
             type: 'image/jpeg',
             name: fileName,
           });
   
         if (error) {
           throw new Error(`Failed to upload image: ${error.message}`);
         }
   
         const { data: urlData } = supabase.storage
           .from('user-images')
           .getPublicUrl(filePath);
   
         return urlData.publicUrl;
       } catch (error) {
         console.error('Error uploading profile image:', error);
         throw error;
       }
     }
   }
   ```

5. **Create Profile Hook**
   ```typescript
   // src/auth/hooks/useProfile.ts
   
   import { useState, useEffect, useCallback } from 'react';
   import { UserProfile, ProfileUpdateData } from '@/types/auth.types';
   import { ProfileManager, ProfileSyncResult } from '../profile/ProfileManager';
   import { ProfileValidator } from '../profile/ProfileValidator';
   import { useAuth } from './useAuth';
   
   export const useProfile = () => {
     const [profile, setProfile] = useState<UserProfile | null>(null);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const { user } = useAuth();
   
     const profileManager = ProfileManager.getInstance();
     const profileValidator = ProfileValidator.getInstance();
   
     const loadProfile = useCallback(async (): Promise<void> => {
       if (!user?.id) return;
   
       setIsLoading(true);
       setError(null);
   
       try {
         const result = await profileManager.getProfile(user.id);
   
         if (result.success && result.profile) {
           setProfile(result.profile);
         } else {
           setError(result.error || 'Failed to load profile');
         }
       } catch (err) {
         const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
         setError(errorMessage);
       } finally {
         setIsLoading(false);
       }
     }, [user?.id]);
   
     const updateProfile = useCallback(async (updateData: ProfileUpdateData): Promise<boolean> => {
       if (!user?.id) return false;
   
       setIsLoading(true);
       setError(null);
   
       try {
         const updatedProfile = await profileManager.updateProfile(user.id, updateData);
         setProfile(updatedProfile);
         return true;
       } catch (err) {
         const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
         setError(errorMessage);
         return false;
       } finally {
         setIsLoading(false);
       }
     }, [user?.id]);
   
     const createProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<boolean> => {
       if (!user?.id) return false;
   
       setIsLoading(true);
       setError(null);
   
       try {
         const newProfile = await profileManager.createProfile({
           ...profileData,
           id: user.id,
         });
         setProfile(newProfile);
         return true;
       } catch (err) {
         const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
         setError(errorMessage);
         return false;
       } finally {
         setIsLoading(false);
       }
     }, [user?.id]);
   
     const syncProfile = useCallback(async (): Promise<void> => {
       if (!user?.id) return;
   
       try {
         const result = await profileManager.syncProfile(user.id);
   
         if (result.success && result.profile) {
           setProfile(result.profile);
         }
       } catch (err) {
         console.error('Profile sync error:', err);
       }
     }, [user?.id]);
   
     const validateProfile = useCallback((profileData: Partial<UserProfile>) => {
       return profileValidator.validateProfile(profileData);
     }, []);
   
     const isProfileComplete = useCallback((profileData?: Partial<UserProfile>) => {
       const dataToCheck = profileData || profile;
       return dataToCheck ? profileValidator.isProfileComplete(dataToCheck) : false;
     }, [profile]);
   
     // Load profile on mount
     useEffect(() => {
       if (user?.id) {
         loadProfile();
       }
     }, [user?.id, loadProfile]);
   
     return {
       profile,
       isLoading,
       error,
       loadProfile,
       updateProfile,
       createProfile,
       syncProfile,
       validateProfile,
       isProfileComplete,
     };
   };
   ```

6. **Create Profile Form Component**
   ```typescript
   // src/auth/components/ProfileForm.tsx
   
   import React, { useState, useEffect } from 'react';
   import {
     View,
     Text,
     TextInput,
     TouchableOpacity,
     StyleSheet,
     ScrollView,
     Alert,
   } from 'react-native';
   import { Picker } from '@react-native-picker/picker';
   import { useProfile } from '../hooks/useProfile';
   import { UserProfile, ProfileUpdateData } from '@/types/auth.types';
   
   interface ProfileFormProps {
     onSave?: (profile: UserProfile) => void;
     onCancel?: () => void;
     initialData?: Partial<UserProfile>;
   }
   
   export const ProfileForm: React.FC<ProfileFormProps> = ({
     onSave,
     onCancel,
     initialData,
   }) => {
     const { profile, isLoading, error, updateProfile, createProfile, validateProfile } = useProfile();
     const [formData, setFormData] = useState<Partial<UserProfile>>(initialData || {});
     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
   
     useEffect(() => {
       if (profile && !initialData) {
         setFormData(profile);
       }
     }, [profile, initialData]);
   
     const handleInputChange = (field: keyof UserProfile, value: any) => {
       setFormData(prev => ({ ...prev, [field]: value }));
       
       // Clear validation error for this field
       if (validationErrors[field]) {
         setValidationErrors(prev => ({ ...prev, [field]: '' }));
       }
     };
   
     const handleSave = async () => {
       const validation = validateProfile(formData);
       setValidationErrors(validation.errors);
   
       if (!validation.isValid) {
         Alert.alert('Validation Error', Object.values(validation.errors).join('\n'));
         return;
       }
   
       try {
         let success = false;
   
         if (profile) {
           success = await updateProfile(formData as ProfileUpdateData);
         } else {
           success = await createProfile(formData);
         }
   
         if (success) {
           onSave?.(profile!);
           Alert.alert('Success', 'Profile saved successfully');
         }
       } catch (err) {
         Alert.alert('Error', 'Failed to save profile');
       }
     };
   
     const renderInput = (
       field: keyof UserProfile,
       label: string,
       placeholder: string,
       type: 'text' | 'number' | 'email' = 'text'
     ) => (
       <View style={styles.inputContainer}>
         <Text style={styles.label}>{label}</Text>
         <TextInput
           style={[styles.input, validationErrors[field] && styles.inputError]}
           placeholder={placeholder}
           value={String(formData[field] || '')}
           onChangeText={(value) => handleInputChange(field, value)}
           keyboardType={type === 'number' ? 'numeric' : 'default'}
           autoCapitalize={type === 'email' ? 'none' : 'words'}
         />
         {validationErrors[field] && (
           <Text style={styles.errorText}>{validationErrors[field]}</Text>
         )}
       </View>
     );
   
     const renderPicker = (
       field: keyof UserProfile,
       label: string,
       options: { label: string; value: any }[]
     ) => (
       <View style={styles.inputContainer}>
         <Text style={styles.label}>{label}</Text>
         <View style={styles.pickerContainer}>
           <Picker
             selectedValue={formData[field]}
             onValueChange={(value) => handleInputChange(field, value)}
             style={styles.picker}
           >
             <Picker.Item label="Select..." value="" />
             {options.map((option) => (
               <Picker.Item
                 key={option.value}
                 label={option.label}
                 value={option.value}
               />
             ))}
           </Picker>
         </View>
       </View>
     );
   
     return (
       <ScrollView style={styles.container}>
         <Text style={styles.title}>Profile Information</Text>
   
         {renderInput('firstName', 'First Name', 'Enter your first name')}
         {renderInput('lastName', 'Last Name', 'Enter your last name')}
         {renderInput('email', 'Email', 'Enter your email', 'email')}
   
         {renderPicker('gender', 'Gender', [
           { label: 'Male', value: 'male' },
           { label: 'Female', value: 'female' },
           { label: 'Other', value: 'other' },
           { label: 'Prefer not to say', value: 'prefer_not_to_say' },
         ])}
   
         {renderInput('height', 'Height (cm)', 'Enter your height', 'number')}
         {renderInput('weight', 'Weight (kg)', 'Enter your weight', 'number')}
   
         {renderPicker('fitnessLevel', 'Fitness Level', [
           { label: 'Beginner', value: 'beginner' },
           { label: 'Intermediate', value: 'intermediate' },
           { label: 'Advanced', value: 'advanced' },
           { label: 'Expert', value: 'expert' },
         ])}
   
         {renderPicker('climbingExperience', 'Climbing Experience', [
           { label: 'None', value: 'none' },
           { label: 'Beginner', value: 'beginner' },
           { label: 'Intermediate', value: 'intermediate' },
           { label: 'Advanced', value: 'advanced' },
           { label: 'Expert', value: 'expert' },
         ])}
   
         {renderPicker('preferredClimbingType', 'Preferred Climbing Type', [
           { label: 'Bouldering', value: 'bouldering' },
           { label: 'Sport', value: 'sport' },
           { label: 'Trad', value: 'trad' },
           { label: 'Alpine', value: 'alpine' },
           { label: 'Mixed', value: 'mixed' },
         ])}
   
         <View style={styles.buttonContainer}>
           <TouchableOpacity
             style={[styles.button, styles.saveButton]}
             onPress={handleSave}
             disabled={isLoading}
           >
             <Text style={styles.buttonText}>
               {isLoading ? 'Saving...' : 'Save Profile'}
             </Text>
           </TouchableOpacity>
   
           {onCancel && (
             <TouchableOpacity
               style={[styles.button, styles.cancelButton]}
               onPress={onCancel}
               disabled={isLoading}
             >
               <Text style={styles.buttonText}>Cancel</Text>
             </TouchableOpacity>
           )}
         </View>
       </ScrollView>
     );
   };
   
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 16,
     },
     title: {
       fontSize: 24,
       fontWeight: 'bold',
       marginBottom: 20,
       textAlign: 'center',
     },
     inputContainer: {
       marginBottom: 16,
     },
     label: {
       fontSize: 16,
       fontWeight: '600',
       marginBottom: 8,
       color: '#333',
     },
     input: {
       borderWidth: 1,
       borderColor: '#ddd',
       borderRadius: 8,
       padding: 12,
       fontSize: 16,
       backgroundColor: '#fff',
     },
     inputError: {
       borderColor: '#ff0000',
     },
     errorText: {
       color: '#ff0000',
       fontSize: 12,
       marginTop: 4,
     },
     pickerContainer: {
       borderWidth: 1,
       borderColor: '#ddd',
       borderRadius: 8,
       backgroundColor: '#fff',
     },
     picker: {
       height: 50,
     },
     buttonContainer: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       marginTop: 20,
     },
     button: {
       flex: 1,
       padding: 16,
       borderRadius: 8,
       marginHorizontal: 8,
     },
     saveButton: {
       backgroundColor: '#007AFF',
     },
     cancelButton: {
       backgroundColor: '#FF3B30',
     },
     buttonText: {
       color: '#fff',
       fontSize: 16,
       fontWeight: '600',
       textAlign: 'center',
     },
   });
   ```

**Key Implementation Details**:
- **Design Patterns**: Singleton pattern for profile managers, Repository pattern for data access
- **Error Handling**: Comprehensive error handling for profile operations
- **Data Validation**: Profile data validation and sanitization
- **Performance Considerations**: Efficient caching and minimal API calls

### Testing Requirements

**Unit Tests**:
- [ ] ProfileValidator tests
- [ ] ProfileStorage tests
- [ ] ProfileManager tests
- [ ] useProfile hook tests
- [ ] ProfileForm component tests

**Integration Tests**:
- [ ] Profile CRUD operations tests
- [ ] Profile validation tests
- [ ] Profile synchronization tests
- [ ] Supabase integration tests

**Manual Testing Steps**:
1. Test profile creation
2. Verify profile validation
3. Test profile updates
4. Validate profile synchronization
5. Test profile image upload
6. Verify offline functionality

### Code Quality Standards

**Code Requirements**:
- [ ] Follow React Native best practices
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure accessibility compliance

**Security Requirements**:
- [ ] Profile data validation
- [ ] Secure image upload
- [ ] Data sanitization
- [ ] Privacy protection

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] User profile management working
- [ ] Profile validation functional
- [ ] Profile synchronization working
- [ ] Profile image upload working
- [ ] Error handling implemented
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- Profile data validation complexity - Mitigation: Implement comprehensive validation
- Image upload security - Mitigation: Use secure upload methods
- Offline sync conflicts - Mitigation: Implement conflict resolution

**Research Required**:
- Profile management best practices
- Image upload security
- Offline data synchronization

### Additional Resources
**Reference Materials**:
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [React Native Image Picker](https://github.com/react-native-image-picker/react-native-image-picker)
- [Form Validation Best Practices](https://react-hook-form.com/)

**Related Code**:
- Authentication state management from ST-MT-3-4
- JWT token handling from ST-MT-3-5
- Authentication UI components from ST-MT-3-7 