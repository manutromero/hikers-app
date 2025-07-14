# Sub-Task 1.7: CI/CD Pipeline Setup

### Objective
Configure GitHub Actions CI/CD pipeline for automated testing, building, and deployment of the mountain climber training app across different environments.

### Main Task Reference
**Parent Task**: [Task 1: Project Setup and Development Environment](../main-tasks-mountain-climber-training-app.md#task-1-project-setup-and-development-environment)
**Context**: This sub-task establishes the automated deployment pipeline that will handle testing, building, and deploying the app to different environments.

### Time Estimation
**Estimated Time**: 4 hours
**Complexity**: High
**Developer Type**: DevOps/Full-Stack

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-1-1 (Expo Project Initialization) completed
- [ ] ST-MT-1-2 (TypeScript and ESLint Configuration) completed
- [ ] ST-MT-1-3 (Hexagonal Architecture Setup) completed
- [ ] ST-MT-1-4 (State Management Configuration) completed
- [ ] ST-MT-1-5 (Navigation Structure Setup) completed
- [ ] ST-MT-1-6 (Environment Configuration) completed
- [ ] GitHub repository set up
- [ ] EAS account configured

**Outputs Needed By**:
- ST-MT-1-8 (Development Tools and Documentation)
- All future development requiring automated deployment

### Acceptance Criteria
- [ ] GitHub Actions workflows configured for all environments
- [ ] Automated testing pipeline implemented
- [ ] Automated building pipeline implemented
- [ ] Automated deployment pipeline implemented
- [ ] Environment-specific secrets configured
- [ ] Build artifacts management configured
- [ ] Deployment notifications configured
- [ ] Rollback procedures documented

### Technical Implementation

**Architecture Context**:
This sub-task implements the infrastructure layer CI/CD pipeline that automates the deployment process across all hexagonal architecture layers.

**Files to Create/Modify**:
```
mountain-climber-training-app/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml (create)
│   │   ├── build-android.yml (create)
│   │   ├── build-ios.yml (create)
│   │   ├── deploy-staging.yml (create)
│   │   ├── deploy-production.yml (create)
│   │   └── release.yml (create)
│   ├── actions/
│   │   ├── setup-expo/action.yml (create)
│   │   └── validate-env/action.yml (create)
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md (create)
│       └── feature_request.md (create)
├── eas.json (create)
├── .github/
│   └── dependabot.yml (create)
└── docs/
    └── deployment.md (create)
```

**Step-by-Step Implementation**:

1. **Create EAS Configuration**:

   **eas.json**:
   ```json
   {
     "cli": {
       "version": ">= 5.2.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal",
         "env": {
           "EXPO_PUBLIC_ENVIRONMENT": "development"
         }
       },
       "staging": {
         "distribution": "internal",
         "env": {
           "EXPO_PUBLIC_ENVIRONMENT": "staging"
         }
       },
       "production": {
         "distribution": "store",
         "env": {
           "EXPO_PUBLIC_ENVIRONMENT": "production"
         }
       }
     },
     "submit": {
       "production": {
         "ios": {
           "appleId": "your-apple-id@example.com",
           "ascAppId": "your-app-store-connect-app-id",
           "appleTeamId": "your-apple-team-id"
         },
         "android": {
           "serviceAccountKeyPath": "./google-service-account.json",
           "track": "production"
         }
       }
     }
   }
   ```

2. **Create Main CI Workflow**:

   **.github/workflows/ci.yml**:
   ```yaml
   name: CI

   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main, develop ]

   jobs:
     test:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Validate environment
         run: npm run validate-env

       - name: Run linting
         run: npm run lint

       - name: Run type checking
         run: npm run type-check

       - name: Run tests
         run: npm test

       - name: Upload test coverage
         uses: codecov/codecov-action@v3
         with:
           file: ./coverage/lcov.info
           flags: unittests
           name: codecov-umbrella

     security:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Run security audit
         run: npm audit --audit-level=moderate

       - name: Run dependency check
         run: npx audit-ci --moderate
   ```

3. **Create Android Build Workflow**:

   **.github/workflows/build-android.yml**:
   ```yaml
   name: Build Android

   on:
     push:
       branches: [ main, develop ]
       paths:
         - 'src/**'
         - 'app.json'
         - 'eas.json'
         - '.github/workflows/build-android.yml'
     workflow_dispatch:
       inputs:
         environment:
           description: 'Environment to build for'
           required: true
           default: 'staging'
           type: choice
           options:
           - development
           - staging
           - production

   jobs:
     build-android:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Setup Expo
         uses: expo/expo-github-action@v8
         with:
           expo-version: latest
           token: ${{ secrets.EXPO_TOKEN }}

       - name: Set environment
         id: set-env
         run: |
           if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
             echo "environment=${{ github.event.inputs.environment }}" >> $GITHUB_OUTPUT
           else
             if [ "${{ github.ref }}" = "refs/heads/main" ]; then
               echo "environment=production" >> $GITHUB_OUTPUT
             else
               echo "environment=staging" >> $GITHUB_OUTPUT
             fi
           fi

       - name: Build Android app
         run: |
           eas build --platform android --profile ${{ steps.set-env.outputs.environment }} --non-interactive

       - name: Upload build artifacts
         uses: actions/upload-artifact@v3
         with:
           name: android-build-${{ steps.set-env.outputs.environment }}
           path: |
             *.apk
             *.aab
           retention-days: 30

       - name: Notify build completion
         if: always()
         uses: 8398a7/action-slack@v3
         with:
           status: ${{ job.status }}
           channel: '#builds'
           webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
         env:
           SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

4. **Create iOS Build Workflow**:

   **.github/workflows/build-ios.yml**:
   ```yaml
   name: Build iOS

   on:
     push:
       branches: [ main, develop ]
       paths:
         - 'src/**'
         - 'app.json'
         - 'eas.json'
         - '.github/workflows/build-ios.yml'
     workflow_dispatch:
       inputs:
         environment:
           description: 'Environment to build for'
           required: true
           default: 'staging'
           type: choice
           options:
           - development
           - staging
           - production

   jobs:
     build-ios:
       runs-on: macos-latest
       
       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Setup Expo
         uses: expo/expo-github-action@v8
         with:
           expo-version: latest
           token: ${{ secrets.EXPO_TOKEN }}

       - name: Set environment
         id: set-env
         run: |
           if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
             echo "environment=${{ github.event.inputs.environment }}" >> $GITHUB_OUTPUT
           else
             if [ "${{ github.ref }}" = "refs/heads/main" ]; then
               echo "environment=production" >> $GITHUB_OUTPUT
             else
               echo "environment=staging" >> $GITHUB_OUTPUT
             fi
           fi

       - name: Build iOS app
         run: |
           eas build --platform ios --profile ${{ steps.set-env.outputs.environment }} --non-interactive

       - name: Upload build artifacts
         uses: actions/upload-artifact@v3
         with:
           name: ios-build-${{ steps.set-env.outputs.environment }}
           path: |
             *.ipa
           retention-days: 30

       - name: Notify build completion
         if: always()
         uses: 8398a7/action-slack@v3
         with:
           status: ${{ job.status }}
           channel: '#builds'
           webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
         env:
           SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

5. **Create Staging Deployment Workflow**:

   **.github/workflows/deploy-staging.yml**:
   ```yaml
   name: Deploy to Staging

   on:
     push:
       branches: [ develop ]
     workflow_dispatch:

   jobs:
     deploy-staging:
       runs-on: ubuntu-latest
       environment: staging
       
       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Setup Expo
         uses: expo/expo-github-action@v8
         with:
           expo-version: latest
           token: ${{ secrets.EXPO_TOKEN }}

       - name: Build and submit to staging
         run: |
           eas build --platform all --profile staging --non-interactive
           eas submit --platform all --profile staging --non-interactive

       - name: Create deployment record
         run: |
           echo "Deployment completed at $(date)" >> deployment.log
           git config --local user.email "action@github.com"
           git config --local user.name "GitHub Action"
           git add deployment.log
           git commit -m "Add deployment record for staging" || exit 0
           git push

       - name: Notify deployment
         uses: 8398a7/action-slack@v3
         with:
           status: ${{ job.status }}
           channel: '#deployments'
           webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
         env:
           SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

6. **Create Production Deployment Workflow**:

   **.github/workflows/deploy-production.yml**:
   ```yaml
   name: Deploy to Production

   on:
     push:
       tags:
         - 'v*'
     workflow_dispatch:
       inputs:
         version:
           description: 'Version to deploy'
           required: true
           type: string

   jobs:
     deploy-production:
       runs-on: ubuntu-latest
       environment: production
       
       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Setup Expo
         uses: expo/expo-github-action@v8
         with:
           expo-version: latest
           token: ${{ secrets.EXPO_TOKEN }}

       - name: Build and submit to production
         run: |
           eas build --platform all --profile production --non-interactive
           eas submit --platform all --profile production --non-interactive

       - name: Create GitHub release
         uses: actions/create-release@v1
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
         with:
           tag_name: ${{ github.ref }}
           release_name: Release ${{ github.ref }}
           body: |
             Production deployment for version ${{ github.ref }}
             
             Changes in this release:
             ${{ github.event.head_commit.message }}
           draft: false
           prerelease: false

       - name: Notify deployment
         uses: 8398a7/action-slack@v3
         with:
           status: ${{ job.status }}
           channel: '#deployments'
           webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
         env:
           SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

7. **Create Release Workflow**:

   **.github/workflows/release.yml**:
   ```yaml
   name: Release

   on:
     push:
       tags:
         - 'v*'

   jobs:
     release:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Generate changelog
         run: |
           npx conventional-changelog-cli@latest --from-last-tag --output-unreleased

       - name: Create release
         uses: actions/create-release@v1
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
         with:
           tag_name: ${{ github.ref }}
           release_name: Release ${{ github.ref }}
           body: |
             ## What's Changed
             
             ${{ steps.changelog.outputs.clean_changelog }}
             
             ## Installation
             
             Download the latest version from the app stores or use the development build.
           draft: false
           prerelease: false

       - name: Notify release
         uses: 8398a7/action-slack@v3
         with:
           status: success
           channel: '#releases'
           webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
         env:
           SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

8. **Create Custom GitHub Actions**:

   **.github/actions/setup-expo/action.yml**:
   ```yaml
   name: 'Setup Expo'
   description: 'Setup Expo CLI and configure environment'

   inputs:
     expo-version:
       description: 'Expo CLI version to use'
       required: false
       default: 'latest'
     token:
       description: 'Expo access token'
       required: true

   runs:
     using: 'composite'
     steps:
       - name: Install Expo CLI
         shell: bash
         run: |
           npm install -g @expo/cli@${{ inputs.expo-version }}

       - name: Login to Expo
         shell: bash
         run: |
           expo login --non-interactive --token ${{ inputs.token }}
   ```

9. **Create Dependabot Configuration**:

   **.github/dependabot.yml**:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
         day: "monday"
         time: "09:00"
         timezone: "UTC"
       open-pull-requests-limit: 10
       reviewers:
         - "your-username"
       assignees:
         - "your-username"
       commit-message:
         prefix: "chore"
         include: "scope"

     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "weekly"
         day: "monday"
         time: "09:00"
         timezone: "UTC"
       open-pull-requests-limit: 5
       reviewers:
         - "your-username"
       assignees:
         - "your-username"
   ```

10. **Create Issue Templates**:

    **.github/ISSUE_TEMPLATE/bug_report.md**:
    ```markdown
    ---
    name: Bug report
    about: Create a report to help us improve
    title: '[BUG] '
    labels: 'bug'
    assignees: ''

    ---

    **Describe the bug**
    A clear and concise description of what the bug is.

    **To Reproduce**
    Steps to reproduce the behavior:
    1. Go to '...'
    2. Click on '....'
    3. Scroll down to '....'
    4. See error

    **Expected behavior**
    A clear and concise description of what you expected to happen.

    **Screenshots**
    If applicable, add screenshots to help explain your problem.

    **Environment:**
    - OS: [e.g. iOS 15.0, Android 12]
    - App Version: [e.g. 1.0.0]
    - Device: [e.g. iPhone 13, Samsung Galaxy S21]

    **Additional context**
    Add any other context about the problem here.
    ```

11. **Create Deployment Documentation**:

    **docs/deployment.md**:
    ```markdown
    # Deployment Guide

    This document describes the CI/CD pipeline and deployment process for the Mountain Climber Training app.

    ## Pipeline Overview

    The app uses GitHub Actions for continuous integration and deployment with the following workflows:

    - **CI**: Runs on every push and PR to main/develop branches
    - **Build Android**: Builds Android app for different environments
    - **Build iOS**: Builds iOS app for different environments
    - **Deploy Staging**: Deploys to staging environment
    - **Deploy Production**: Deploys to production environment
    - **Release**: Creates releases and changelogs

    ## Environments

    ### Development
    - Branch: `develop`
    - Build Profile: `development`
    - Distribution: Internal
    - Auto-deploy: Yes

    ### Staging
    - Branch: `develop` (manual trigger)
    - Build Profile: `staging`
    - Distribution: Internal
    - Auto-deploy: Yes

    ### Production
    - Branch: `main` (tagged releases)
    - Build Profile: `production`
    - Distribution: App Stores
    - Auto-deploy: No (manual approval required)

    ## Required Secrets

    Configure the following secrets in your GitHub repository:

    - `EXPO_TOKEN`: Expo access token
    - `SLACK_WEBHOOK_URL`: Slack webhook for notifications
    - `GOOGLE_SERVICE_ACCOUNT`: Google Play Console service account
    - `APPLE_ID`: Apple Developer account credentials

    ## Deployment Process

    1. **Development**: Push to `develop` branch triggers automatic build and deployment
    2. **Staging**: Manual trigger or push to `develop` with specific paths
    3. **Production**: Create and push a tag (e.g., `v1.0.0`) to trigger production deployment

    ## Rollback Procedure

    To rollback a deployment:

    1. Identify the previous working version
    2. Create a new tag with the previous version
    3. Push the tag to trigger a new deployment
    4. Monitor the deployment status

    ## Monitoring

    - Build status is reported to Slack #builds channel
    - Deployment status is reported to Slack #deployments channel
    - Release notifications are sent to Slack #releases channel
    - Sentry integration for error tracking in production

    ## Troubleshooting

    Common issues and solutions:

    - **Build failures**: Check EAS build logs and environment configuration
    - **Deployment failures**: Verify app store credentials and submission requirements
    - **Environment issues**: Validate environment variables and configuration files
    ```

**Key Implementation Details**:
- **Design Patterns**: Pipeline pattern, Observer pattern for notifications
- **Error Handling**: Comprehensive error handling and rollback procedures
- **Data Validation**: Environment validation and security checks
- **Performance Considerations**: Parallel builds, caching, and artifact management

### Testing Requirements

**Unit Tests**:
- [ ] Workflow files are valid YAML
- [ ] Environment validation works correctly
- [ ] Build scripts execute without errors
- [ ] Notification systems work properly

**Integration Tests**:
- [ ] CI pipeline runs successfully
- [ ] Build processes complete successfully
- [ ] Deployment processes work correctly
- [ ] Rollback procedures function properly

**Manual Testing Steps**:
1. Test CI pipeline with a sample PR
2. Verify build processes for all environments
3. Test deployment to staging environment
4. Validate notification systems
5. Test rollback procedures

### Code Quality Standards

**Code Requirements**:
- [ ] All workflows follow GitHub Actions best practices
- [ ] Environment validation is comprehensive
- [ ] Error handling is implemented throughout
- [ ] Security best practices are followed

**Security Requirements**:
- [ ] Secrets are properly configured and secured
- [ ] Environment-specific access controls
- [ ] Build artifacts are properly managed
- [ ] Deployment approvals are required for production

### Definition of Done
- [ ] All GitHub Actions workflows configured and working
- [ ] Automated testing pipeline implemented
- [ ] Automated building pipeline implemented
- [ ] Automated deployment pipeline implemented
- [ ] Environment-specific secrets configured
- [ ] Build artifacts management configured
- [ ] Deployment notifications configured
- [ ] Rollback procedures documented and tested

### Potential Challenges
**Known Risks**:
- Build timeouts - Mitigation: Optimize build processes and use caching
- Environment conflicts - Mitigation: Proper environment isolation
- Deployment failures - Mitigation: Comprehensive error handling and rollback

**Research Required**:
- GitHub Actions best practices for mobile apps
- EAS build optimization strategies
- App store deployment automation

### Additional Resources
**Reference Materials**:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo GitHub Action](https://github.com/expo/expo-github-action)

**Related Code**:
- [GitHub Actions Examples](https://github.com/actions/starter-workflows)
- [EAS Build Examples](https://github.com/expo/expo/tree/main/templates) 