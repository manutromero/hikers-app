# Sub-Task 1.3: Hexagonal Architecture Setup

### Objective
Establish the hexagonal architecture (ports and adapters) folder structure and base classes for the mountain climber training app, following clean architecture principles.

### Main Task Reference
**Parent Task**: [Task 1: Project Setup and Development Environment](../main-tasks-mountain-climber-training-app.md#task-1-project-setup-and-development-environment)
**Context**: This sub-task creates the foundational architecture structure that will organize all future development into domain, application, and infrastructure layers.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: High
**Developer Type**: Full-Stack

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-1-1 (Expo Project Initialization) completed
- [ ] ST-MT-1-2 (TypeScript and ESLint Configuration) completed
- [ ] Understanding of hexagonal architecture principles

**Outputs Needed By**:
- ST-MT-1-4 (State Management Configuration)
- ST-MT-1-5 (Navigation Structure Setup)
- All future feature development

### Acceptance Criteria
- [ ] Hexagonal architecture folder structure created
- [ ] Base interfaces and abstract classes defined
- [ ] Domain entities structure established
- [ ] Repository pattern interfaces defined
- [ ] Service layer abstractions created
- [ ] Dependency injection structure set up
- [ ] Base error handling classes implemented
- [ ] Architecture documentation created

### Technical Implementation

**Architecture Context**:
This sub-task implements the hexagonal architecture pattern with clear separation between domain, application, and infrastructure layers, enabling testability and maintainability.

**Files to Create/Modify**:
```
mountain-climber-training-app/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── index.ts
│   │   │   ├── User.ts
│   │   │   ├── Training.ts
│   │   │   ├── WearableData.ts
│   │   │   └── ReadinessScore.ts
│   │   ├── repositories/
│   │   │   ├── index.ts
│   │   │   ├── IUserRepository.ts
│   │   │   ├── ITrainingRepository.ts
│   │   │   ├── IWearableDataRepository.ts
│   │   │   └── IReadinessScoreRepository.ts
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── IReadinessCalculationService.ts
│   │   │   └── ITrainingValidationService.ts
│   │   ├── events/
│   │   │   ├── index.ts
│   │   │   ├── DomainEvent.ts
│   │   │   ├── TrainingCompletedEvent.ts
│   │   │   └── DataSyncedEvent.ts
│   │   └── exceptions/
│   │       ├── index.ts
│   │       ├── DomainException.ts
│   │       └── ValidationException.ts
│   ├── application/
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── UserService.ts
│   │   │   ├── TrainingService.ts
│   │   │   └── ReadinessService.ts
│   │   ├── dto/
│   │   │   ├── index.ts
│   │   │   ├── UserDTO.ts
│   │   │   ├── TrainingDTO.ts
│   │   │   └── ReadinessScoreDTO.ts
│   │   ├── handlers/
│   │   │   ├── index.ts
│   │   │   ├── WearableDataHandler.ts
│   │   │   └── SurveyHandler.ts
│   │   └── use-cases/
│   │       ├── index.ts
│   │       ├── CompleteTrainingUseCase.ts
│   │       └── CalculateReadinessUseCase.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── index.ts
│   │   │   ├── SupabaseUserRepository.ts
│   │   │   ├── SupabaseTrainingRepository.ts
│   │   │   └── SupabaseWearableDataRepository.ts
│   │   ├── external-apis/
│   │   │   ├── index.ts
│   │   │   ├── GarminAPI.ts
│   │   │   ├── AppleHealthAPI.ts
│   │   │   └── YouTubeAPI.ts
│   │   ├── persistence/
│   │   │   ├── index.ts
│   │   │   ├── SupabaseClient.ts
│   │   │   └── DatabaseConfig.ts
│   │   └── messaging/
│   │       ├── index.ts
│   │       └── EventBus.ts
│   ├── shared/
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── Result.ts
│   │   │   └── Either.ts
│   │   ├── utils/
│   │   │   ├── index.ts
│   │   │   ├── ValidationUtils.ts
│   │   │   └── DateUtils.ts
│   │   └── constants/
│   │       ├── index.ts
│   │       └── AppConstants.ts
│   └── presentation/
│       ├── components/
│       │   ├── index.ts
│       │   └── common/
│       ├── screens/
│       │   ├── index.ts
│       │   └── auth/
│       ├── navigation/
│       │   ├── index.ts
│       │   └── AppNavigator.ts
│       └── hooks/
│           ├── index.ts
│           └── useAuth.ts
```

**Step-by-Step Implementation**:

1. **Create Domain Layer Base Classes**:

   **src/domain/entities/User.ts**:
   ```typescript
   export interface User {
     id: string;
     email: string;
     profile: UserProfile;
     wearableDevices: WearableDevice[];
     createdAt: Date;
     updatedAt: Date;
   }

   export interface UserProfile {
     age: number;
     weight: number;
     mountainExperience: ExperienceLevel;
     availableTrainingDays: number;
     targetMountain: Mountain;
   }

   export enum ExperienceLevel {
     BEGINNER = 'beginner',
     INTERMEDIATE = 'intermediate',
     ADVANCED = 'advanced'
   }

   export interface Mountain {
     id: string;
     name: string;
     elevation: number;
     difficulty: string;
     readinessCriteria: ReadinessCriteria;
   }

   export interface ReadinessCriteria {
     vo2MaxMin: number;
     trainingLoadOptimal: string;
     hrvStatusStable: boolean;
     recoveryTimeMax: number;
   }
   ```

   **src/domain/entities/Training.ts**:
   ```typescript
   export interface Training {
     id: string;
     userId: string;
     title: string;
     duration: number;
     intensity: IntensityLevel;
     videoUrl?: string;
     description: string;
     scheduledDate: Date;
     completedDate?: Date;
     status: TrainingStatus;
     notes?: string;
   }

   export enum IntensityLevel {
     LOW = 'low',
     MEDIUM = 'medium',
     HIGH = 'high'
   }

   export enum TrainingStatus {
     SCHEDULED = 'scheduled',
     IN_PROGRESS = 'in_progress',
     COMPLETED = 'completed',
     CANCELLED = 'cancelled'
   }
   ```

2. **Create Repository Interfaces**:

   **src/domain/repositories/IUserRepository.ts**:
   ```typescript
   import { User } from '../entities/User';
   import { Result } from '@/shared/types/Result';

   export interface IUserRepository {
     findById(id: string): Promise<Result<User | null, Error>>;
     findByEmail(email: string): Promise<Result<User | null, Error>>;
     create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<User, Error>>;
     update(id: string, user: Partial<User>): Promise<Result<User, Error>>;
     delete(id: string): Promise<Result<void, Error>>;
   }
   ```

   **src/domain/repositories/ITrainingRepository.ts**:
   ```typescript
   import { Training } from '../entities/Training';
   import { Result } from '@/shared/types/Result';

   export interface ITrainingRepository {
     findById(id: string): Promise<Result<Training | null, Error>>;
     findByUserId(userId: string): Promise<Result<Training[], Error>>;
     findUpcomingByUserId(userId: string): Promise<Result<Training[], Error>>;
     create(training: Omit<Training, 'id'>): Promise<Result<Training, Error>>;
     update(id: string, training: Partial<Training>): Promise<Result<Training, Error>>;
     delete(id: string): Promise<Result<void, Error>>;
   }
   ```

3. **Create Domain Services**:

   **src/domain/services/IReadinessCalculationService.ts**:
   ```typescript
   import { ReadinessScore } from '../entities/ReadinessScore';
   import { WearableData } from '../entities/WearableData';
   import { Result } from '@/shared/types/Result';

   export interface IReadinessCalculationService {
     calculateReadiness(
       userId: string,
       mountainId: string,
       wearableData: WearableData[]
     ): Promise<Result<ReadinessScore, Error>>;
   }
   ```

4. **Create Application Layer Services**:

   **src/application/services/UserService.ts**:
   ```typescript
   import { IUserRepository } from '@/domain/repositories/IUserRepository';
   import { User } from '@/domain/entities/User';
   import { Result } from '@/shared/types/Result';

   export class UserService {
     constructor(private userRepository: IUserRepository) {}

     async getUserById(id: string): Promise<Result<User | null, Error>> {
       return this.userRepository.findById(id);
     }

     async updateUserProfile(
       id: string,
       profile: Partial<User['profile']>
     ): Promise<Result<User, Error>> {
       const userResult = await this.userRepository.findById(id);
       if (userResult.isError()) {
         return userResult;
       }

       const user = userResult.value;
       if (!user) {
         return Result.failure(new Error('User not found'));
       }

       const updatedUser: User = {
         ...user,
         profile: { ...user.profile, ...profile },
         updatedAt: new Date()
       };

       return this.userRepository.update(id, updatedUser);
     }
   }
   ```

5. **Create Shared Types**:

   **src/shared/types/Result.ts**:
   ```typescript
   export class Result<T, E = Error> {
     private constructor(
       private readonly isSuccess: boolean,
       private readonly error?: E,
       private readonly value?: T
     ) {}

     static success<U>(value: U): Result<U> {
       return new Result<U>(true, undefined, value);
     }

     static failure<U>(error: E): Result<U, E> {
       return new Result<U, E>(false, error, undefined);
     }

     getValue(): T {
       if (!this.isSuccess) {
         throw new Error('Cannot get value from failure result');
       }
       return this.value!;
     }

     getError(): E {
       if (this.isSuccess) {
         throw new Error('Cannot get error from success result');
       }
       return this.error!;
     }

     isError(): boolean {
       return !this.isSuccess;
     }

     map<U>(fn: (value: T) => U): Result<U, E> {
       if (this.isSuccess) {
         return Result.success(fn(this.value!));
       }
       return Result.failure(this.error!);
     }

     flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
       if (this.isSuccess) {
         return fn(this.value!);
       }
       return Result.failure(this.error!);
     }
   }
   ```

6. **Create Domain Events**:

   **src/domain/events/DomainEvent.ts**:
   ```typescript
   export abstract class DomainEvent {
     public readonly occurredOn: Date;
     public readonly eventId: string;

     constructor() {
       this.occurredOn = new Date();
       this.eventId = this.generateEventId();
     }

     private generateEventId(): string {
       return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
     }

     abstract getEventName(): string;
   }
   ```

   **src/domain/events/TrainingCompletedEvent.ts**:
   ```typescript
   import { DomainEvent } from './DomainEvent';

   export class TrainingCompletedEvent extends DomainEvent {
     constructor(
       public readonly trainingId: string,
       public readonly userId: string,
       public readonly completedAt: Date
     ) {
       super();
     }

     getEventName(): string {
       return 'TrainingCompleted';
     }
   }
   ```

7. **Create Infrastructure Base Classes**:

   **src/infrastructure/persistence/SupabaseClient.ts**:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   export class SupabaseClient {
     private static instance: SupabaseClient;
     private client: any;

     private constructor() {
       const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
       const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

       this.client = createClient(supabaseUrl, supabaseAnonKey, {
         auth: {
           autoRefreshToken: true,
           persistSession: true,
           detectSessionInUrl: false
         }
       });
     }

     static getInstance(): SupabaseClient {
       if (!SupabaseClient.instance) {
         SupabaseClient.instance = new SupabaseClient();
       }
       return SupabaseClient.instance;
     }

     getClient() {
       return this.client;
     }
   }
   ```

8. **Create Index Files for Clean Imports**:

   **src/domain/index.ts**:
   ```typescript
   export * from './entities';
   export * from './repositories';
   export * from './services';
   export * from './events';
   export * from './exceptions';
   ```

   **src/application/index.ts**:
   ```typescript
   export * from './services';
   export * from './dto';
   export * from './handlers';
   export * from './use-cases';
   ```

   **src/infrastructure/index.ts**:
   ```typescript
   export * from './repositories';
   export * from './external-apis';
   export * from './persistence';
   export * from './messaging';
   ```

**Key Implementation Details**:
- **Design Patterns**: Repository pattern, Factory pattern, Observer pattern
- **Error Handling**: Result type for functional error handling
- **Data Validation**: Domain entities with validation rules
- **Performance Considerations**: Lazy loading and dependency injection

### Testing Requirements

**Unit Tests**:
- [ ] Domain entities validation tests
- [ ] Repository interface contract tests
- [ ] Service layer business logic tests
- [ ] Result type utility tests

**Integration Tests**:
- [ ] Domain service integration tests
- [ ] Repository implementation tests
- [ ] Event handling tests

**Manual Testing Steps**:
1. Verify TypeScript compilation passes
2. Check that all imports resolve correctly
3. Verify folder structure follows hexagonal architecture
4. Test that base classes can be extended

### Code Quality Standards

**Code Requirements**:
- [ ] All interfaces follow naming conventions (I prefix for interfaces)
- [ ] All domain entities are immutable
- [ ] All services follow single responsibility principle
- [ ] All repositories have proper error handling
- [ ] All events extend DomainEvent base class

**Security Requirements**:
- [ ] Domain entities validate input data
- [ ] Repository interfaces define security boundaries
- [ ] Service layer enforces business rules

### Definition of Done
- [ ] Complete hexagonal architecture folder structure created
- [ ] All base interfaces and classes implemented
- [ ] Domain entities with proper validation
- [ ] Repository pattern interfaces defined
- [ ] Service layer abstractions created
- [ ] Event system foundation implemented
- [ ] All TypeScript compilation passes
- [ ] Architecture documentation created

### Potential Challenges
**Known Risks**:
- Over-engineering the architecture - Mitigation: Keep it simple, add complexity as needed
- Circular dependencies - Mitigation: Proper layer separation and dependency direction
- TypeScript path resolution issues - Mitigation: Proper tsconfig.json configuration

**Research Required**:
- Hexagonal architecture best practices for React Native
- Domain-driven design patterns for mobile apps
- Event sourcing patterns for real-time updates

### Additional Resources
**Reference Materials**:
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

**Related Code**:
- [React Native Architecture Patterns](https://reactnative.dev/docs/architecture-overview)
- [TypeScript Design Patterns](https://refactoring.guru/design-patterns/typescript) 