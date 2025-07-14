# Sub-Task 1.1: Expo Project Initialization

### Objective
Initialize a new Expo project with Managed Workflow and configure the basic project structure for the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 1: Project Setup and Development Environment](../main-tasks-mountain-climber-training-app.md#task-1-project-setup-and-development-environment)
**Context**: This is the foundational sub-task that creates the base Expo project structure and essential configuration files.

### Time Estimation
**Estimated Time**: 2 hours
**Complexity**: Low
**Developer Type**: Full-Stack

### Dependencies
**Prerequisites**: 
- [ ] Node.js 18+ installed
- [ ] Expo CLI installed globally
- [ ] Git repository initialized
- [ ] iOS Simulator and Android Emulator available

**Outputs Needed By**:
- ST-MT-1-2 (TypeScript and ESLint Configuration)
- ST-MT-1-3 (Hexagonal Architecture Setup)

### Acceptance Criteria
- [ ] Expo project created with Managed Workflow
- [ ] Project runs successfully on iOS Simulator
- [ ] Project runs successfully on Android Emulator
- [ ] Basic app structure with App.tsx is functional
- [ ] Package.json contains correct dependencies
- [ ] app.json configured with proper app metadata
- [ ] Git repository properly initialized with .gitignore

### Technical Implementation

**Architecture Context**:
This sub-task establishes the foundation for the hexagonal architecture by creating the basic project structure that will be organized into domain, application, and infrastructure layers.

**Files to Create/Modify**:
```
mountain-climber-training-app/
├── App.tsx (create)
├── app.json (create)
├── package.json (create)
├── .gitignore (create)
├── README.md (create)
├── metro.config.js (create)
├── babel.config.js (create)
└── tsconfig.json (create)
```

**Step-by-Step Implementation**:

1. **Create Expo Project**:
   ```bash
   npx create-expo-app@latest mountain-climber-training-app --template blank-typescript
   cd mountain-climber-training-app
   ```

2. **Configure app.json**:
   ```json
   {
     "expo": {
       "name": "Mountain Climber Training",
       "slug": "mountain-climber-training",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "userInterfaceStyle": "light",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "assetBundlePatterns": [
         "**/*"
       ],
       "ios": {
         "supportsTablet": true,
         "bundleIdentifier": "com.yourcompany.mountainclimber"
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#FFFFFF"
         },
         "package": "com.yourcompany.mountainclimber"
       },
       "web": {
         "favicon": "./assets/favicon.png"
       },
       "plugins": [
         "expo-health",
         "expo-secure-store",
         "expo-notifications"
       ]
     }
   }
   ```

3. **Update package.json**:
   ```json
   {
     "name": "mountain-climber-training",
     "version": "1.0.0",
     "main": "node_modules/expo/AppEntry.js",
     "scripts": {
       "start": "expo start",
       "android": "expo start --android",
       "ios": "expo start --ios",
       "web": "expo start --web",
       "test": "jest",
       "lint": "eslint . --ext .ts,.tsx",
       "lint:fix": "eslint . --ext .ts,.tsx --fix",
       "type-check": "tsc --noEmit"
     },
     "dependencies": {
       "expo": "~49.0.0",
       "expo-status-bar": "~1.6.0",
       "react": "18.2.0",
       "react-native": "0.72.6"
     },
     "devDependencies": {
       "@babel/core": "^7.20.0",
       "@types/react": "~18.2.14",
       "@types/react-native": "~0.72.2",
       "typescript": "^5.1.3"
     },
     "private": true
   }
   ```

4. **Create .gitignore**:
   ```
   node_modules/
   .expo/
   dist/
   npm-debug.*
   *.jks
   *.p8
   *.p12
   *.key
   *.mobileprovision
   *.orig.*
   web-build/
   .DS_Store
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   ```

5. **Create basic App.tsx**:
   ```typescript
   import { StatusBar } from 'expo-status-bar';
   import { StyleSheet, Text, View } from 'react-native';

   export default function App() {
     return (
       <View style={styles.container}>
         <Text>Mountain Climber Training App</Text>
         <StatusBar style="auto" />
       </View>
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

6. **Initialize Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Expo project setup"
   ```

**Key Implementation Details**:
- **Design Patterns**: Basic React Native component structure
- **Error Handling**: Expo error boundary will be added in later sub-tasks
- **Data Validation**: Not applicable for this sub-task
- **Performance Considerations**: Basic Expo optimization settings

### Testing Requirements

**Unit Tests**:
- [ ] App component renders without errors
- [ ] Basic styling is applied correctly

**Integration Tests**:
- [ ] App launches successfully on iOS Simulator
- [ ] App launches successfully on Android Emulator

**Manual Testing Steps**:
1. Run `npm start` and verify Expo development server starts
2. Press 'i' to open iOS Simulator and verify app loads
3. Press 'a' to open Android Emulator and verify app loads
4. Verify basic "Mountain Climber Training App" text displays

### Code Quality Standards

**Code Requirements**:
- [ ] Follow React Native and Expo best practices
- [ ] Use TypeScript for all new files
- [ ] Ensure proper file structure and naming conventions
- [ ] Add basic comments for complex configurations

**Security Requirements**:
- [ ] Ensure .env files are in .gitignore
- [ ] Verify no sensitive information in app.json

### Definition of Done
- [ ] Expo project created and runs on both platforms
- [ ] All configuration files properly set up
- [ ] Git repository initialized with proper .gitignore
- [ ] Manual testing completed successfully
- [ ] No TypeScript errors in the project
- [ ] Project can be cloned and run by other team members

### Potential Challenges
**Known Risks**:
- Expo CLI version compatibility issues - Mitigation: Use latest stable version
- Simulator/Emulator setup issues - Mitigation: Verify Xcode and Android Studio installations

**Research Required**:
- Latest Expo SDK version and compatibility
- Required Expo plugins for health data access

### Additional Resources
**Reference Materials**:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native TypeScript Template](https://github.com/expo/expo/tree/main/templates/expo-template-blank-typescript)
- [Expo Managed Workflow Guide](https://docs.expo.dev/introduction/managed-vs-bare/)

**Related Code**:
- [Expo TypeScript Template](https://github.com/expo/expo/tree/main/templates/expo-template-blank-typescript)
- [Expo Configuration Documentation](https://docs.expo.dev/versions/latest/config/app/) 