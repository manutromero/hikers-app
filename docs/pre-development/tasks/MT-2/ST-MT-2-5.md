## Sub-Task MT-2.5: Training and Readiness Assessment Tables

### Objective
Create and implement database tables for training plan management, session tracking, and readiness assessment algorithms with mountain-specific scoring and recommendations.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This implements the core training and readiness assessment data layer, enabling personalized training plans and mountain-specific readiness calculations.

### Time Estimation
**Estimated Time**: 3 hours
**Complexity**: High
**Developer Type**: Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-2 (Database Schema Design and Core Tables)
- [ ] Mountains table created and populated
- [ ] User profiles table configured

**Outputs Needed By**:
- ST-MT-2-8 (Database Indexes and Performance Optimization)
- ST-MT-2-7 (Row Level Security (RLS) Policies Implementation)

### Acceptance Criteria
- [ ] Training plans table created
- [ ] Training sessions table implemented
- [ ] Readiness scores table created
- [ ] Assessment algorithms table implemented
- [ ] Training progress tracking tables created
- [ ] Mountain-specific readiness calculations implemented
- [ ] Database migration files created and tested
- [ ] Performance optimization for training data

### Technical Implementation

**Architecture Context**:
This sub-task implements the domain layer of the hexagonal architecture, defining the core training and readiness assessment entities and their relationships.

**Files to Create/Modify**:
```
supabase/
├── migrations/
│   └── 20240115000005_training_tables.sql
├── functions/
│   ├── training_functions.sql
│   └── readiness_functions.sql
└── algorithms/
    └── readiness_algorithms.sql
```

**Step-by-Step Implementation**:

1. **Create Training Plans Table**
   ```sql
   -- supabase/migrations/20240115000005_training_tables.sql
   
   -- Training plans table
   CREATE TABLE training_plans (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
       plan_name VARCHAR(255) NOT NULL,
       plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('beginner', 'intermediate', 'advanced', 'expert', 'custom')),
       target_date DATE NOT NULL,
       start_date DATE NOT NULL,
       duration_weeks INTEGER NOT NULL,
       difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('easy', 'moderate', 'hard', 'expert')),
       is_active BOOLEAN DEFAULT true,
       is_completed BOOLEAN DEFAULT false,
       completion_percentage DECIMAL(5,2) DEFAULT 0.00,
       plan_configuration JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Training sessions table
   CREATE TABLE training_sessions (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
       session_name VARCHAR(255) NOT NULL,
       session_type VARCHAR(100) NOT NULL CHECK (session_type IN (
           'cardio', 'strength', 'endurance', 'flexibility', 'balance', 
           'altitude_training', 'technical_skills', 'recovery', 'assessment'
       )),
       scheduled_date DATE NOT NULL,
       scheduled_time TIME,
       duration_minutes INTEGER NOT NULL,
       intensity_level VARCHAR(20) NOT NULL CHECK (intensity_level IN ('low', 'moderate', 'high', 'very_high')),
       is_completed BOOLEAN DEFAULT false,
       completed_at TIMESTAMP WITH TIME ZONE,
       actual_duration_minutes INTEGER,
       actual_intensity_level VARCHAR(20),
       performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 10),
       notes TEXT,
       session_data JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Training exercises table
   CREATE TABLE training_exercises (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
       exercise_name VARCHAR(255) NOT NULL,
       exercise_type VARCHAR(100) NOT NULL,
       description TEXT,
       sets INTEGER,
       reps INTEGER,
       duration_seconds INTEGER,
       weight_kg DECIMAL(6,2),
       distance_meters DECIMAL(8,2),
       elevation_meters INTEGER,
       rest_seconds INTEGER,
       is_completed BOOLEAN DEFAULT false,
       actual_sets INTEGER,
       actual_reps INTEGER,
       actual_duration_seconds INTEGER,
       actual_weight_kg DECIMAL(6,2),
       actual_distance_meters DECIMAL(8,2),
       actual_elevation_meters INTEGER,
       exercise_notes TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Readiness scores table
   CREATE TABLE readiness_scores (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       mountain_id UUID NOT NULL REFERENCES mountains(id) ON DELETE CASCADE,
       assessment_date DATE NOT NULL,
       overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
       cardiovascular_score DECIMAL(5,2) CHECK (cardiovascular_score BETWEEN 0 AND 100),
       strength_score DECIMAL(5,2) CHECK (strength_score BETWEEN 0 AND 100),
       endurance_score DECIMAL(5,2) CHECK (endurance_score BETWEEN 0 AND 100),
       technical_score DECIMAL(5,2) CHECK (technical_score BETWEEN 0 AND 100),
       mental_score DECIMAL(5,2) CHECK (mental_score BETWEEN 0 AND 100),
       altitude_score DECIMAL(5,2) CHECK (altitude_score BETWEEN 0 AND 100),
       readiness_status VARCHAR(50) NOT NULL CHECK (readiness_status IN ('not_ready', 'needs_improvement', 'ready', 'very_ready')),
       confidence_level DECIMAL(3,2) CHECK (confidence_level BETWEEN 0 AND 1),
       assessment_data JSONB,
       recommendations JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Assessment algorithms table
   CREATE TABLE assessment_algorithms (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       algorithm_name VARCHAR(255) NOT NULL UNIQUE,
       algorithm_version VARCHAR(50) NOT NULL,
       algorithm_type VARCHAR(100) NOT NULL CHECK (algorithm_type IN ('cardiovascular', 'strength', 'endurance', 'technical', 'mental', 'altitude', 'overall')),
       is_active BOOLEAN DEFAULT true,
       algorithm_configuration JSONB NOT NULL,
       weight_factors JSONB,
       thresholds JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Training progress tracking table
   CREATE TABLE training_progress (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
       week_number INTEGER NOT NULL,
       week_start_date DATE NOT NULL,
       week_end_date DATE NOT NULL,
       sessions_completed INTEGER DEFAULT 0,
       sessions_scheduled INTEGER DEFAULT 0,
       completion_rate DECIMAL(5,2) DEFAULT 0.00,
       average_performance_rating DECIMAL(4,2),
       total_training_time_minutes INTEGER DEFAULT 0,
       total_distance_meters DECIMAL(10,2) DEFAULT 0,
       total_elevation_meters INTEGER DEFAULT 0,
       progress_notes TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id, plan_id, week_number)
   );
   ```

2. **Create Indexes for Performance**
   ```sql
   -- Training plans indexes
   CREATE INDEX idx_training_plans_user_id ON training_plans(user_id);
   CREATE INDEX idx_training_plans_mountain_id ON training_plans(mountain_id);
   CREATE INDEX idx_training_plans_active ON training_plans(is_active);
   CREATE INDEX idx_training_plans_target_date ON training_plans(target_date);
   
   -- Training sessions indexes
   CREATE INDEX idx_training_sessions_user_id ON training_sessions(user_id);
   CREATE INDEX idx_training_sessions_plan_id ON training_sessions(plan_id);
   CREATE INDEX idx_training_sessions_scheduled_date ON training_sessions(scheduled_date);
   CREATE INDEX idx_training_sessions_completed ON training_sessions(is_completed);
   CREATE INDEX idx_training_sessions_type ON training_sessions(session_type);
   
   -- Training exercises indexes
   CREATE INDEX idx_training_exercises_session_id ON training_exercises(session_id);
   CREATE INDEX idx_training_exercises_completed ON training_exercises(is_completed);
   
   -- Readiness scores indexes
   CREATE INDEX idx_readiness_scores_user_id ON readiness_scores(user_id);
   CREATE INDEX idx_readiness_scores_mountain_id ON readiness_scores(mountain_id);
   CREATE INDEX idx_readiness_scores_assessment_date ON readiness_scores(assessment_date);
   CREATE INDEX idx_readiness_scores_overall_score ON readiness_scores(overall_score);
   CREATE INDEX idx_readiness_scores_status ON readiness_scores(readiness_status);
   
   -- Assessment algorithms indexes
   CREATE INDEX idx_assessment_algorithms_type ON assessment_algorithms(algorithm_type);
   CREATE INDEX idx_assessment_algorithms_active ON assessment_algorithms(is_active);
   
   -- Training progress indexes
   CREATE INDEX idx_training_progress_user_id ON training_progress(user_id);
   CREATE INDEX idx_training_progress_plan_id ON training_progress(plan_id);
   CREATE INDEX idx_training_progress_week ON training_progress(week_number);
   ```

3. **Create Training Management Functions**
   ```sql
   -- supabase/functions/training_functions.sql
   
   -- Function to get user's active training plans
   CREATE OR REPLACE FUNCTION get_user_training_plans(user_id UUID)
   RETURNS TABLE (
       plan_id UUID,
       plan_name VARCHAR(255),
       mountain_name VARCHAR(255),
       target_date DATE,
       completion_percentage DECIMAL(5,2),
       is_active BOOLEAN
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           tp.id,
           tp.plan_name,
           m.name as mountain_name,
           tp.target_date,
           tp.completion_percentage,
           tp.is_active
       FROM training_plans tp
       JOIN mountains m ON tp.mountain_id = m.id
       WHERE tp.user_id = get_user_training_plans.user_id
           AND tp.is_active = true
       ORDER BY tp.target_date ASC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get training sessions for a plan
   CREATE OR REPLACE FUNCTION get_plan_training_sessions(plan_id UUID)
   RETURNS TABLE (
       session_id UUID,
       session_name VARCHAR(255),
       session_type VARCHAR(100),
       scheduled_date DATE,
       duration_minutes INTEGER,
       intensity_level VARCHAR(20),
       is_completed BOOLEAN,
       performance_rating INTEGER
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           ts.id,
           ts.session_name,
           ts.session_type,
           ts.scheduled_date,
           ts.duration_minutes,
           ts.intensity_level,
           ts.is_completed,
           ts.performance_rating
       FROM training_sessions ts
       WHERE ts.plan_id = get_plan_training_sessions.plan_id
       ORDER BY ts.scheduled_date ASC, ts.scheduled_time ASC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to complete a training session
   CREATE OR REPLACE FUNCTION complete_training_session(
       p_session_id UUID,
       p_actual_duration_minutes INTEGER,
       p_actual_intensity_level VARCHAR(20),
       p_performance_rating INTEGER,
       p_notes TEXT DEFAULT NULL
   )
   RETURNS BOOLEAN AS $$
   BEGIN
       UPDATE training_sessions 
       SET 
           is_completed = true,
           completed_at = NOW(),
           actual_duration_minutes = p_actual_duration_minutes,
           actual_intensity_level = p_actual_intensity_level,
           performance_rating = p_performance_rating,
           notes = p_notes,
           updated_at = NOW()
       WHERE id = p_session_id;
       
       RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to calculate plan completion percentage
   CREATE OR REPLACE FUNCTION calculate_plan_completion(plan_id UUID)
   RETURNS DECIMAL(5,2) AS $$
   DECLARE
       total_sessions INTEGER;
       completed_sessions INTEGER;
       completion_percentage DECIMAL(5,2);
   BEGIN
       -- Get total sessions
       SELECT COUNT(*) INTO total_sessions
       FROM training_sessions
       WHERE plan_id = calculate_plan_completion.plan_id;
       
       -- Get completed sessions
       SELECT COUNT(*) INTO completed_sessions
       FROM training_sessions
       WHERE plan_id = calculate_plan_completion.plan_id AND is_completed = true;
       
       -- Calculate percentage
       IF total_sessions > 0 THEN
           completion_percentage = (completed_sessions::DECIMAL / total_sessions::DECIMAL) * 100;
       ELSE
           completion_percentage = 0;
       END IF;
       
       -- Update plan completion percentage
       UPDATE training_plans 
       SET completion_percentage = completion_percentage
       WHERE id = calculate_plan_completion.plan_id;
       
       RETURN completion_percentage;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Create Readiness Assessment Functions**
   ```sql
   -- supabase/functions/readiness_functions.sql
   
   -- Function to calculate readiness score for a mountain
   CREATE OR REPLACE FUNCTION calculate_readiness_score(
       p_user_id UUID,
       p_mountain_id UUID
   )
   RETURNS TABLE (
       overall_score DECIMAL(5,2),
       cardiovascular_score DECIMAL(5,2),
       strength_score DECIMAL(5,2),
       endurance_score DECIMAL(5,2),
       technical_score DECIMAL(5,2),
       mental_score DECIMAL(5,2),
       altitude_score DECIMAL(5,2),
       readiness_status VARCHAR(50),
       confidence_level DECIMAL(3,2)
   ) AS $$
   DECLARE
       mountain_record RECORD;
       user_profile RECORD;
       wearable_data RECORD;
       training_data RECORD;
       cv_score DECIMAL(5,2) := 0;
       strength_score DECIMAL(5,2) := 0;
       endurance_score DECIMAL(5,2) := 0;
       technical_score DECIMAL(5,2) := 0;
       mental_score DECIMAL(5,2) := 0;
       altitude_score DECIMAL(5,2) := 0;
       overall_score DECIMAL(5,2) := 0;
       readiness_status VARCHAR(50);
       confidence_level DECIMAL(3,2) := 0.8;
   BEGIN
       -- Get mountain information
       SELECT * INTO mountain_record FROM mountains WHERE id = p_mountain_id;
       
       -- Get user profile
       SELECT * INTO user_profile FROM user_profiles WHERE id = p_user_id;
       
       -- Calculate cardiovascular score based on wearable data
       SELECT AVG(value) INTO cv_score
       FROM wearable_data
       WHERE user_id = p_user_id 
           AND data_type = 'heart_rate'
           AND recorded_at >= NOW() - INTERVAL '30 days';
       
       -- Normalize cardiovascular score (assuming 60-200 bpm range)
       cv_score = LEAST(GREATEST((cv_score - 60) / (200 - 60) * 100, 0), 100);
       
       -- Calculate strength score based on training data
       SELECT COUNT(*) INTO strength_score
       FROM training_sessions ts
       JOIN training_exercises te ON ts.id = te.session_id
       WHERE ts.user_id = p_user_id 
           AND ts.session_type = 'strength'
           AND ts.is_completed = true
           AND ts.completed_at >= NOW() - INTERVAL '90 days';
       
       -- Normalize strength score (assuming 0-50 sessions range)
       strength_score = LEAST(strength_score * 2, 100);
       
       -- Calculate endurance score based on training data
       SELECT COALESCE(SUM(actual_duration_minutes), 0) INTO endurance_score
       FROM training_sessions
       WHERE user_id = p_user_id 
           AND session_type IN ('cardio', 'endurance')
           AND is_completed = true
           AND completed_at >= NOW() - INTERVAL '90 days';
       
       -- Normalize endurance score (assuming 0-3000 minutes range)
       endurance_score = LEAST(endurance_score / 30, 100);
       
       -- Calculate technical score based on training data
       SELECT COUNT(*) INTO technical_score
       FROM training_sessions
       WHERE user_id = p_user_id 
           AND session_type = 'technical_skills'
           AND is_completed = true
           AND completed_at >= NOW() - INTERVAL '180 days';
       
       -- Normalize technical score (assuming 0-20 sessions range)
       technical_score = LEAST(technical_score * 5, 100);
       
       -- Calculate mental score based on completion rates
       SELECT AVG(completion_percentage) INTO mental_score
       FROM training_plans
       WHERE user_id = p_user_id 
           AND is_active = false
           AND updated_at >= NOW() - INTERVAL '180 days';
       
       -- Calculate altitude score based on training data
       SELECT COALESCE(SUM(actual_elevation_meters), 0) INTO altitude_score
       FROM training_sessions ts
       JOIN training_exercises te ON ts.id = te.session_id
       WHERE ts.user_id = p_user_id 
           AND ts.is_completed = true
           AND ts.completed_at >= NOW() - INTERVAL '90 days';
       
       -- Normalize altitude score (assuming 0-50000 meters range)
       altitude_score = LEAST(altitude_score / 500, 100);
       
       -- Calculate overall score (weighted average)
       overall_score = (cv_score * 0.25 + strength_score * 0.20 + endurance_score * 0.25 + 
                       technical_score * 0.15 + mental_score * 0.10 + altitude_score * 0.05);
       
       -- Determine readiness status
       IF overall_score >= 85 THEN
           readiness_status := 'very_ready';
       ELSIF overall_score >= 70 THEN
           readiness_status := 'ready';
       ELSIF overall_score >= 50 THEN
           readiness_status := 'needs_improvement';
       ELSE
           readiness_status := 'not_ready';
       END IF;
       
       RETURN QUERY SELECT 
           overall_score,
           cv_score,
           strength_score,
           endurance_score,
           technical_score,
           mental_score,
           altitude_score,
           readiness_status,
           confidence_level;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to store readiness assessment
   CREATE OR REPLACE FUNCTION store_readiness_assessment(
       p_user_id UUID,
       p_mountain_id UUID,
       p_assessment_date DATE DEFAULT CURRENT_DATE
   )
   RETURNS UUID AS $$
   DECLARE
       assessment_id UUID;
       assessment_data RECORD;
   BEGIN
       -- Calculate readiness scores
       SELECT * INTO assessment_data
       FROM calculate_readiness_score(p_user_id, p_mountain_id);
       
       -- Store assessment
       INSERT INTO readiness_scores (
           user_id,
           mountain_id,
           assessment_date,
           overall_score,
           cardiovascular_score,
           strength_score,
           endurance_score,
           technical_score,
           mental_score,
           altitude_score,
           readiness_status,
           confidence_level
       ) VALUES (
           p_user_id,
           p_mountain_id,
           p_assessment_date,
           assessment_data.overall_score,
           assessment_data.cardiovascular_score,
           assessment_data.strength_score,
           assessment_data.endurance_score,
           assessment_data.technical_score,
           assessment_data.mental_score,
           assessment_data.altitude_score,
           assessment_data.readiness_status,
           assessment_data.confidence_level
       ) RETURNING id INTO assessment_id;
       
       RETURN assessment_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get readiness history
   CREATE OR REPLACE FUNCTION get_readiness_history(
       p_user_id UUID,
       p_mountain_id UUID,
       p_days_back INTEGER DEFAULT 90
   )
   RETURNS TABLE (
       assessment_date DATE,
       overall_score DECIMAL(5,2),
       readiness_status VARCHAR(50),
       confidence_level DECIMAL(3,2)
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           rs.assessment_date,
           rs.overall_score,
           rs.readiness_status,
           rs.confidence_level
       FROM readiness_scores rs
       WHERE rs.user_id = p_user_id
           AND rs.mountain_id = p_mountain_id
           AND rs.assessment_date >= CURRENT_DATE - (p_days_back || ' days')::INTERVAL
       ORDER BY rs.assessment_date DESC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Insert Default Assessment Algorithms**
   ```sql
   -- Insert default assessment algorithms
   INSERT INTO assessment_algorithms (algorithm_name, algorithm_version, algorithm_type, algorithm_configuration, weight_factors, thresholds) VALUES
   ('cardiovascular_fitness_v1', '1.0', 'cardiovascular', 
    '{"metrics": ["heart_rate", "vo2_max", "hrv"], "time_window_days": 30}',
    '{"heart_rate": 0.4, "vo2_max": 0.4, "hrv": 0.2}',
    '{"excellent": 85, "good": 70, "fair": 50, "poor": 30}'),
   
   ('strength_assessment_v1', '1.0', 'strength',
    '{"metrics": ["training_sessions", "exercise_volume", "progressive_overload"]}',
    '{"training_sessions": 0.5, "exercise_volume": 0.3, "progressive_overload": 0.2}',
    '{"excellent": 80, "good": 65, "fair": 45, "poor": 25}'),
   
   ('endurance_calculation_v1', '1.0', 'endurance',
    '{"metrics": ["training_duration", "distance_covered", "intensity_levels"]}',
    '{"training_duration": 0.4, "distance_covered": 0.4, "intensity_levels": 0.2}',
    '{"excellent": 90, "good": 75, "fair": 55, "poor": 35}'),
   
   ('technical_skills_v1', '1.0', 'technical',
    '{"metrics": ["skill_sessions", "difficulty_progression", "mastery_level"]}',
    '{"skill_sessions": 0.6, "difficulty_progression": 0.3, "mastery_level": 0.1}',
    '{"excellent": 85, "good": 70, "fair": 50, "poor": 30}'),
   
   ('mental_preparation_v1', '1.0', 'mental',
    '{"metrics": ["completion_rate", "consistency", "goal_achievement"]}',
    '{"completion_rate": 0.5, "consistency": 0.3, "goal_achievement": 0.2}',
    '{"excellent": 90, "good": 75, "fair": 55, "poor": 35}'),
   
   ('altitude_readiness_v1', '1.0', 'altitude',
    '{"metrics": ["elevation_training", "acclimatization", "altitude_exposure"]}',
    '{"elevation_training": 0.5, "acclimatization": 0.3, "altitude_exposure": 0.2}',
    '{"excellent": 80, "good": 65, "fair": 45, "poor": 25}');
   ```

6. **Create Updated At Triggers**
   ```sql
   -- Create triggers for updated_at columns
   CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_assessment_algorithms_updated_at BEFORE UPDATE ON assessment_algorithms
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_training_progress_updated_at BEFORE UPDATE ON training_progress
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

**Key Implementation Details**:
- **Design Patterns**: Algorithm pattern, assessment pattern, progress tracking pattern
- **Error Handling**: Comprehensive error handling for calculations
- **Data Validation**: Proper constraints and validation rules
- **Performance Considerations**: Efficient calculations, strategic indexing

### Testing Requirements

**Unit Tests**:
- [ ] Training plan management tests
- [ ] Session completion tests
- [ ] Readiness calculation tests
- [ ] Algorithm validation tests

**Integration Tests**:
- [ ] Training progress tracking tests
- [ ] Readiness assessment integration tests
- [ ] Performance with large datasets

**Manual Testing Steps**:
1. Test training plan creation and management
2. Verify session completion and tracking
3. Test readiness score calculations
4. Validate algorithm configurations
5. Test progress tracking functionality

### Code Quality Standards

**Code Requirements**:
- [ ] Follow PostgreSQL best practices
- [ ] Use consistent naming conventions
- [ ] Implement proper data validation
- [ ] Add comprehensive comments
- [ ] Ensure data integrity

**Security Requirements**:
- [ ] User data isolation
- [ ] Algorithm security
- [ ] Data access validation
- [ ] Assessment accuracy validation

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All training tables created and tested
- [ ] Functions and algorithms implemented
- [ ] Performance optimization completed
- [ ] Readiness calculations working
- [ ] Progress tracking functional
- [ ] Integration testing passed

### Potential Challenges
**Known Risks**:
- Algorithm complexity - Mitigation: Start with simple algorithms and iterate
- Performance with large datasets - Mitigation: Implement efficient calculations
- Assessment accuracy - Mitigation: Validate against real-world data

**Research Required**:
- Mountain climbing training methodologies
- Readiness assessment algorithms
- Performance optimization techniques

### Additional Resources
**Reference Materials**:
- [Mountain Training Best Practices](https://www.mountain-training.org/)
- [Fitness Assessment Algorithms](https://www.acsm.org/)
- [PostgreSQL Performance Optimization](https://www.postgresql.org/docs/current/performance.html)

**Related Code**:
- Core database schema from ST-MT-2-2
- Wearable data from ST-MT-2-4
- RLS policies from ST-MT-2-7 