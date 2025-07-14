# Sub-Task 1.6: Environment Configuration

### Objective
Configure environment variables, development tools, and project settings for different environments (development, staging, production) in the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 1: Project Setup and Development Environment](../main-tasks-mountain-climber-training-app.md#task-1-project-setup-and-development-environment)
**Context**: This sub-task establishes the environment configuration foundation that will manage different settings across development, staging, and production environments.

### Time Estimation
**Estimated Time**: 2 hours
**Complexity**: Low
**Developer Type**: Full-Stack

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-1-1 (Expo Project Initialization) completed
- [ ] ST-MT-1-2 (TypeScript and ESLint Configuration) completed
- [ ] ST-MT-1-3 (Hexagonal Architecture Setup) completed
- [ ] ST-MT-1-4 (State Management Configuration) completed
- [ ] ST-MT-1-5 (Navigation Structure Setup) completed

**Outputs Needed By**:
- ST-MT-1-7 (CI/CD Pipeline Setup)
- ST-MT-1-8 (Development Tools and Documentation)
- All future feature development requiring environment-specific configuration

### Acceptance Criteria
- [ ] Environment variables configured for all environments
- [ ] Expo configuration updated for different environments
- [ ] Supabase configuration set up
- [ ] Development tools configured (Metro, Babel)
- [ ] Environment-specific app configurations created
- [ ] Build scripts configured for different environments
- [ ] Environment validation implemented
- [ ] Documentation for environment setup created

### Technical Implementation

**Architecture Context**:
This sub-task configures the infrastructure layer environment settings that will be used across all hexagonal architecture layers.

**Files to Create/Modify**:
```
mountain-climber-training-app/
├── .env.development (create)
├── .env.staging (create)
├── .env.production (create)
├── .env.example (create)
├── app.config.js (modify)
├── metro.config.js (modify)
├── babel.config.js (modify)
├── src/
│   ├── shared/
│   │   ├── config/
│   │   │   ├── index.ts
│   │   │   ├── Environment.ts
│   │   │   ├── SupabaseConfig.ts
│   │   │   └── AppConfig.ts
│   │   └── utils/
│   │       └── environment.ts
├── scripts/
│   ├── build-android.js (create)
│   ├── build-ios.js (create)
│   └── validate-env.js (create)
└── docs/
    └── environment-setup.md (create)
```

**Step-by-Step Implementation**:

1. **Create Environment Files**:

   **.env.example**:
   ```bash
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # API Configuration
   EXPO_PUBLIC_API_BASE_URL=https://api.mountainclimber.com
   EXPO_PUBLIC_API_VERSION=v1

   # External Services
   EXPO_PUBLIC_GARMIN_CLIENT_ID=your_garmin_client_id
   EXPO_PUBLIC_GARMIN_CLIENT_SECRET=your_garmin_client_secret
   EXPO_PUBLIC_APPLE_HEALTH_CLIENT_ID=your_apple_health_client_id

   # YouTube API
   EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key

   # Sentry Configuration
   EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

   # App Configuration
   EXPO_PUBLIC_APP_NAME=Mountain Climber Training
   EXPO_PUBLIC_APP_VERSION=1.0.0
   EXPO_PUBLIC_ENVIRONMENT=development

   # Feature Flags
   EXPO_PUBLIC_ENABLE_ANALYTICS=false
   EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
   EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
   ```

   **.env.development**:
   ```bash
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
   EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key

   # API Configuration
   EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
   EXPO_PUBLIC_API_VERSION=v1

   # External Services
   EXPO_PUBLIC_GARMIN_CLIENT_ID=dev_garmin_client_id
   EXPO_PUBLIC_GARMIN_CLIENT_SECRET=dev_garmin_client_secret
   EXPO_PUBLIC_APPLE_HEALTH_CLIENT_ID=dev_apple_health_client_id

   # YouTube API
   EXPO_PUBLIC_YOUTUBE_API_KEY=dev_youtube_api_key

   # Sentry Configuration
   EXPO_PUBLIC_SENTRY_DSN=https://dev_sentry_dsn

   # App Configuration
   EXPO_PUBLIC_APP_NAME=Mountain Climber Training (Dev)
   EXPO_PUBLIC_APP_VERSION=1.0.0
   EXPO_PUBLIC_ENVIRONMENT=development

   # Feature Flags
   EXPO_PUBLIC_ENABLE_ANALYTICS=false
   EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
   EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
   ```

   **.env.staging**:
   ```bash
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
   EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

   # API Configuration
   EXPO_PUBLIC_API_BASE_URL=https://staging-api.mountainclimber.com
   EXPO_PUBLIC_API_VERSION=v1

   # External Services
   EXPO_PUBLIC_GARMIN_CLIENT_ID=staging_garmin_client_id
   EXPO_PUBLIC_GARMIN_CLIENT_SECRET=staging_garmin_client_secret
   EXPO_PUBLIC_APPLE_HEALTH_CLIENT_ID=staging_apple_health_client_id

   # YouTube API
   EXPO_PUBLIC_YOUTUBE_API_KEY=staging_youtube_api_key

   # Sentry Configuration
   EXPO_PUBLIC_SENTRY_DSN=https://staging_sentry_dsn

   # App Configuration
   EXPO_PUBLIC_APP_NAME=Mountain Climber Training (Staging)
   EXPO_PUBLIC_APP_VERSION=1.0.0
   EXPO_PUBLIC_ENVIRONMENT=staging

   # Feature Flags
   EXPO_PUBLIC_ENABLE_ANALYTICS=true
   EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
   EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
   ```

   **.env.production**:
   ```bash
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

   # API Configuration
   EXPO_PUBLIC_API_BASE_URL=https://api.mountainclimber.com
   EXPO_PUBLIC_API_VERSION=v1

   # External Services
   EXPO_PUBLIC_GARMIN_CLIENT_ID=production_garmin_client_id
   EXPO_PUBLIC_GARMIN_CLIENT_SECRET=production_garmin_client_secret
   EXPO_PUBLIC_APPLE_HEALTH_CLIENT_ID=production_apple_health_client_id

   # YouTube API
   EXPO_PUBLIC_YOUTUBE_API_KEY=production_youtube_api_key

   # Sentry Configuration
   EXPO_PUBLIC_SENTRY_DSN=https://production_sentry_dsn

   # App Configuration
   EXPO_PUBLIC_APP_NAME=Mountain Climber Training
   EXPO_PUBLIC_APP_VERSION=1.0.0
   EXPO_PUBLIC_ENVIRONMENT=production

   # Feature Flags
   EXPO_PUBLIC_ENABLE_ANALYTICS=true
   EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
   EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
   ```

2. **Create Environment Configuration**:

   **src/shared/config/Environment.ts**:
   ```typescript
   export enum Environment {
     DEVELOPMENT = 'development',
     STAGING = 'staging',
     PRODUCTION = 'production',
   }

   export interface EnvironmentConfig {
     environment: Environment;
     isDevelopment: boolean;
     isStaging: boolean;
     isProduction: boolean;
     isDebug: boolean;
   }

   export const getEnvironment = (): EnvironmentConfig => {
     const env = process.env.EXPO_PUBLIC_ENVIRONMENT as Environment;
     const isDebug = __DEV__;

     return {
       environment: env || Environment.DEVELOPMENT,
       isDevelopment: env === Environment.DEVELOPMENT,
       isStaging: env === Environment.STAGING,
       isProduction: env === Environment.PRODUCTION,
       isDebug,
     };
   };

   export const environment = getEnvironment();
   ```

   **src/shared/config/SupabaseConfig.ts**:
   ```typescript
   export interface SupabaseConfig {
     url: string;
     anonKey: string;
     serviceRoleKey: string;
   }

   export const getSupabaseConfig = (): SupabaseConfig => {
     const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
     const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
     const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

     if (!url || !anonKey) {
       throw new Error('Missing required Supabase configuration');
     }

     return {
       url,
       anonKey,
       serviceRoleKey: serviceRoleKey || '',
     };
   };

   export const supabaseConfig = getSupabaseConfig();
   ```

   **src/shared/config/AppConfig.ts**:
   ```typescript
   export interface AppConfig {
     name: string;
     version: string;
     apiBaseUrl: string;
     apiVersion: string;
     enableAnalytics: boolean;
     enableCrashReporting: boolean;
     enablePushNotifications: boolean;
   }

   export const getAppConfig = (): AppConfig => {
     return {
       name: process.env.EXPO_PUBLIC_APP_NAME || 'Mountain Climber Training',
       version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
       apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
       apiVersion: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
       enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
       enableCrashReporting: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
       enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
     };
   };

   export const appConfig = getAppConfig();
   ```

3. **Update Expo Configuration**:

   **app.config.js**:
   ```javascript
   import 'dotenv/config';

   const getEnvironmentConfig = () => {
     const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
     
     const configs = {
       development: {
         name: 'Mountain Climber Training (Dev)',
         slug: 'mountain-climber-training-dev',
         bundleIdentifier: 'com.yourcompany.mountainclimber.dev',
         package: 'com.yourcompany.mountainclimber.dev',
       },
       staging: {
         name: 'Mountain Climber Training (Staging)',
         slug: 'mountain-climber-training-staging',
         bundleIdentifier: 'com.yourcompany.mountainclimber.staging',
         package: 'com.yourcompany.mountainclimber.staging',
       },
       production: {
         name: 'Mountain Climber Training',
         slug: 'mountain-climber-training',
         bundleIdentifier: 'com.yourcompany.mountainclimber',
         package: 'com.yourcompany.mountainclimber',
       },
     };

     return configs[environment] || configs.development;
   };

   const envConfig = getEnvironmentConfig();

   export default {
     expo: {
       name: envConfig.name,
       slug: envConfig.slug,
       version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
       orientation: 'portrait',
       icon: './assets/icon.png',
       userInterfaceStyle: 'light',
       splash: {
         image: './assets/splash.png',
         resizeMode: 'contain',
         backgroundColor: '#ffffff',
       },
       assetBundlePatterns: ['**/*'],
       ios: {
         supportsTablet: true,
         bundleIdentifier: envConfig.bundleIdentifier,
         config: {
           usesNonExemptEncryption: false,
         },
       },
       android: {
         adaptiveIcon: {
           foregroundImage: './assets/adaptive-icon.png',
           backgroundColor: '#FFFFFF',
         },
         package: envConfig.package,
       },
       web: {
         favicon: './assets/favicon.png',
       },
       plugins: [
         'expo-health',
         'expo-secure-store',
         'expo-notifications',
         [
           'expo-build-properties',
           {
             ios: {
               deploymentTarget: '13.0',
             },
             android: {
               compileSdkVersion: 33,
               targetSdkVersion: 33,
               buildToolsVersion: '33.0.0',
             },
           },
         ],
       ],
       extra: {
         eas: {
           projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
         },
       },
     },
   };
   ```

4. **Create Environment Validation Utility**:

   **src/shared/utils/environment.ts**:
   ```typescript
   import { environment } from '../config/Environment';
   import { supabaseConfig } from '../config/SupabaseConfig';
   import { appConfig } from '../config/AppConfig';

   export function validateEnvironment(): void {
     const errors: string[] = [];

     // Validate Supabase configuration
     if (!supabaseConfig.url) {
       errors.push('EXPO_PUBLIC_SUPABASE_URL is required');
     }
     if (!supabaseConfig.anonKey) {
       errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
     }

     // Validate API configuration
     if (!appConfig.apiBaseUrl) {
       errors.push('EXPO_PUBLIC_API_BASE_URL is required');
     }

     // Validate environment
     if (!environment.environment) {
       errors.push('EXPO_PUBLIC_ENVIRONMENT is required');
     }

     if (errors.length > 0) {
       throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
     }
   }

   export function logEnvironmentInfo(): void {
     if (environment.isDebug) {
       console.log('Environment Configuration:', {
         environment: environment.environment,
         apiBaseUrl: appConfig.apiBaseUrl,
         supabaseUrl: supabaseConfig.url,
         enableAnalytics: appConfig.enableAnalytics,
         enableCrashReporting: appConfig.enableCrashReporting,
       });
     }
   }
   ```

5. **Create Build Scripts**:

   **scripts/build-android.js**:
   ```javascript
   const { execSync } = require('child_process');
   const fs = require('fs');
   const path = require('path');

   const environment = process.argv[2] || 'development';

   if (!['development', 'staging', 'production'].includes(environment)) {
     console.error('Invalid environment. Use: development, staging, or production');
     process.exit(1);
   }

   console.log(`Building Android app for ${environment} environment...`);

   // Copy environment file
   const envFile = path.join(__dirname, '..', `.env.${environment}`);
   const envTarget = path.join(__dirname, '..', '.env');

   if (fs.existsSync(envFile)) {
     fs.copyFileSync(envFile, envTarget);
     console.log(`Copied ${envFile} to .env`);
   } else {
     console.error(`Environment file ${envFile} not found`);
     process.exit(1);
   }

   try {
     // Build the app
     execSync(`eas build --platform android --profile ${environment}`, {
       stdio: 'inherit',
       cwd: path.join(__dirname, '..'),
     });
   } catch (error) {
     console.error('Build failed:', error);
     process.exit(1);
   }
   ```

   **scripts/build-ios.js**:
   ```javascript
   const { execSync } = require('child_process');
   const fs = require('fs');
   const path = require('path');

   const environment = process.argv[2] || 'development';

   if (!['development', 'staging', 'production'].includes(environment)) {
     console.error('Invalid environment. Use: development, staging, or production');
     process.exit(1);
   }

   console.log(`Building iOS app for ${environment} environment...`);

   // Copy environment file
   const envFile = path.join(__dirname, '..', `.env.${environment}`);
   const envTarget = path.join(__dirname, '..', '.env');

   if (fs.existsSync(envFile)) {
     fs.copyFileSync(envFile, envTarget);
     console.log(`Copied ${envFile} to .env`);
   } else {
     console.error(`Environment file ${envFile} not found`);
     process.exit(1);
   }

   try {
     // Build the app
     execSync(`eas build --platform ios --profile ${environment}`, {
       stdio: 'inherit',
       cwd: path.join(__dirname, '..'),
     });
   } catch (error) {
     console.error('Build failed:', error);
     process.exit(1);
   }
   ```

6. **Update Package.json Scripts**:

   **package.json** (scripts section):
   ```json
   {
     "scripts": {
       "start": "expo start",
       "android": "expo start --android",
       "ios": "expo start --ios",
       "web": "expo start --web",
       "test": "jest",
       "lint": "eslint . --ext .ts,.tsx",
       "lint:fix": "eslint . --ext .ts,.tsx --fix",
       "type-check": "tsc --noEmit",
       "format": "prettier --write .",
       "format:check": "prettier --check .",
       "prepare": "husky install",
       "validate-env": "node scripts/validate-env.js",
       "build:android:dev": "node scripts/build-android.js development",
       "build:android:staging": "node scripts/build-android.js staging",
       "build:android:prod": "node scripts/build-android.js production",
       "build:ios:dev": "node scripts/build-ios.js development",
       "build:ios:staging": "node scripts/build-ios.js staging",
       "build:ios:prod": "node scripts/build-ios.js production"
     }
   }
   ```

7. **Create Environment Setup Documentation**:

   **docs/environment-setup.md**:
   ```markdown
   # Environment Setup Guide

   This document describes how to set up different environments for the Mountain Climber Training app.

   ## Environment Files

   The app uses different environment files for different deployment stages:

   - `.env.development` - Local development
   - `.env.staging` - Staging/testing environment
   - `.env.production` - Production environment
   - `.env.example` - Template for environment variables

   ## Required Environment Variables

   ### Supabase Configuration
   - `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

   ### API Configuration
   - `EXPO_PUBLIC_API_BASE_URL` - Base URL for API calls
   - `EXPO_PUBLIC_API_VERSION` - API version

   ### External Services
   - `EXPO_PUBLIC_GARMIN_CLIENT_ID` - Garmin API client ID
   - `EXPO_PUBLIC_GARMIN_CLIENT_SECRET` - Garmin API client secret
   - `EXPO_PUBLIC_APPLE_HEALTH_CLIENT_ID` - Apple HealthKit client ID
   - `EXPO_PUBLIC_YOUTUBE_API_KEY` - YouTube API key

   ### Monitoring
   - `EXPO_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking

   ### App Configuration
   - `EXPO_PUBLIC_APP_NAME` - App display name
   - `EXPO_PUBLIC_APP_VERSION` - App version
   - `EXPO_PUBLIC_ENVIRONMENT` - Current environment

   ### Feature Flags
   - `EXPO_PUBLIC_ENABLE_ANALYTICS` - Enable analytics
   - `EXPO_PUBLIC_ENABLE_CRASH_REPORTING` - Enable crash reporting
   - `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS` - Enable push notifications

   ## Setup Instructions

   1. Copy `.env.example` to create your environment files
   2. Fill in the required values for each environment
   3. Ensure `.env` files are in `.gitignore`
   4. Run `npm run validate-env` to verify configuration

   ## Build Commands

   ### Android
   - Development: `npm run build:android:dev`
   - Staging: `npm run build:android:staging`
   - Production: `npm run build:android:prod`

   ### iOS
   - Development: `npm run build:ios:dev`
   - Staging: `npm run build:ios:staging`
   - Production: `npm run build:ios:prod`

   ## Environment Validation

   The app includes environment validation that runs at startup to ensure all required variables are present.
   ```

**Key Implementation Details**:
- **Design Patterns**: Configuration pattern, Environment pattern
- **Error Handling**: Environment validation with clear error messages
- **Data Validation**: TypeScript types for configuration objects
- **Performance Considerations**: Environment-specific optimizations

### Testing Requirements

**Unit Tests**:
- [ ] Environment configuration loads correctly
- [ ] Environment validation works properly
- [ ] Configuration objects have correct types
- [ ] Build scripts execute without errors

**Integration Tests**:
- [ ] Environment variables are accessible in app
- [ ] Different environments load correct configurations
- [ ] Build process works for all environments

**Manual Testing Steps**:
1. Verify environment variables load correctly
2. Test build scripts for different environments
3. Validate environment configuration
4. Check that sensitive data is not exposed

### Code Quality Standards

**Code Requirements**:
- [ ] All environment variables are properly typed
- [ ] Environment validation is comprehensive
- [ ] Build scripts handle errors gracefully
- [ ] Configuration is centralized and organized

**Security Requirements**:
- [ ] Sensitive environment variables are not committed to git
- [ ] Environment validation prevents invalid configurations
- [ ] Production secrets are properly secured

### Definition of Done
- [ ] Environment files created for all environments
- [ ] Expo configuration updated for different environments
- [ ] Environment validation implemented
- [ ] Build scripts created and working
- [ ] Configuration types defined with TypeScript
- [ ] Documentation created for environment setup
- [ ] All environment variables properly configured

### Potential Challenges
**Known Risks**:
- Environment variable conflicts - Mitigation: Clear naming conventions
- Build script complexity - Mitigation: Simple, focused scripts
- Configuration validation - Mitigation: Comprehensive validation

**Research Required**:
- Expo environment configuration best practices
- EAS build configuration strategies
- Environment variable security best practices

### Additional Resources
**Reference Materials**:
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Configuration](https://docs.expo.dev/build/introduction/)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

**Related Code**:
- [Expo Configuration Documentation](https://docs.expo.dev/versions/latest/config/app/)
- [EAS Build Profiles](https://docs.expo.dev/build/eas-json/) 