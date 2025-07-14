## Sub-Task MT-2.6: Content and Media Management Tables

### Objective
Create and implement database tables for video content delivery, media management, and training content organization with YouTube API integration and offline caching support.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This implements the content management layer for training videos, media storage, and content delivery optimization.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: Medium
**Developer Type**: Backend

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-2 (Database Schema Design and Core Tables)
- [ ] System configuration table created

**Outputs Needed By**:
- ST-MT-2-10 (Storage Buckets and Real-time Setup)
- ST-MT-2-7 (Row Level Security (RLS) Policies Implementation)

### Acceptance Criteria
- [ ] Video content table created
- [ ] Media metadata table implemented
- [ ] Content categories table created
- [ ] User content preferences table implemented
- [ ] Cache management table created
- [ ] Content analytics table implemented
- [ ] Database migration files created and tested
- [ ] Content delivery optimization implemented

### Technical Implementation

**Architecture Context**:
This sub-task implements the domain layer of the hexagonal architecture, defining the content management and media delivery entities.

**Files to Create/Modify**:
```
supabase/
├── migrations/
│   └── 20240115000006_content_tables.sql
├── functions/
│   ├── content_functions.sql
│   └── cache_functions.sql
└── types/
    └── content_types.sql
```

**Step-by-Step Implementation**:

1. **Create Video Content Table**
   ```sql
   -- supabase/migrations/20240115000006_content_tables.sql
   
   -- Video content table
   CREATE TABLE video_content (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       youtube_video_id VARCHAR(20) UNIQUE,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       duration_seconds INTEGER,
       thumbnail_url TEXT,
       video_url TEXT,
       quality_levels JSONB,
       content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
           'training', 'technique', 'safety', 'motivation', 'education', 'inspiration'
       )),
       difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
       target_audience VARCHAR(100),
       tags TEXT[],
       language VARCHAR(10) DEFAULT 'en',
       is_active BOOLEAN DEFAULT true,
       is_featured BOOLEAN DEFAULT false,
       view_count INTEGER DEFAULT 0,
       like_count INTEGER DEFAULT 0,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Content categories table
   CREATE TABLE content_categories (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       category_name VARCHAR(100) NOT NULL UNIQUE,
       category_description TEXT,
       parent_category_id UUID REFERENCES content_categories(id),
       display_order INTEGER DEFAULT 0,
       is_active BOOLEAN DEFAULT true,
       icon_name VARCHAR(100),
       color_hex VARCHAR(7),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Content categorization table (many-to-many)
   CREATE TABLE content_categorization (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       video_id UUID NOT NULL REFERENCES video_content(id) ON DELETE CASCADE,
       category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(video_id, category_id)
   );
   
   -- User content preferences table
   CREATE TABLE user_content_preferences (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       content_type VARCHAR(50),
       difficulty_level VARCHAR(20),
       language VARCHAR(10) DEFAULT 'en',
       auto_play BOOLEAN DEFAULT true,
       quality_preference VARCHAR(20) DEFAULT 'auto' CHECK (quality_preference IN ('low', 'medium', 'high', 'auto')),
       subtitles_enabled BOOLEAN DEFAULT false,
       content_notifications BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id)
   );
   
   -- Content cache management table
   CREATE TABLE content_cache (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       video_id UUID NOT NULL REFERENCES video_content(id) ON DELETE CASCADE,
       cache_status VARCHAR(20) NOT NULL CHECK (cache_status IN ('pending', 'downloading', 'completed', 'failed', 'expired')),
       file_path TEXT,
       file_size_bytes BIGINT,
       quality_level VARCHAR(20),
       download_progress DECIMAL(5,2) DEFAULT 0.00,
       expires_at TIMESTAMP WITH TIME ZONE,
       download_started_at TIMESTAMP WITH TIME ZONE,
       download_completed_at TIMESTAMP WITH TIME ZONE,
       error_message TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id, video_id)
   );
   
   -- Content analytics table
   CREATE TABLE content_analytics (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       video_id UUID NOT NULL REFERENCES video_content(id) ON DELETE CASCADE,
       event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
           'view', 'play', 'pause', 'resume', 'complete', 'like', 'dislike', 'share', 'download'
       )),
       event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
       watch_duration_seconds INTEGER,
       playback_position_seconds INTEGER,
       device_info JSONB,
       network_conditions JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- User content history table
   CREATE TABLE user_content_history (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
       video_id UUID NOT NULL REFERENCES video_content(id) ON DELETE CASCADE,
       last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL,
       total_watch_time_seconds INTEGER DEFAULT 0,
       watch_count INTEGER DEFAULT 1,
       is_favorite BOOLEAN DEFAULT false,
       user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
       user_notes TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id, video_id)
   );
   ```

2. **Create Indexes for Performance**
   ```sql
   -- Video content indexes
   CREATE INDEX idx_video_content_type ON video_content(content_type);
   CREATE INDEX idx_video_content_difficulty ON video_content(difficulty_level);
   CREATE INDEX idx_video_content_active ON video_content(is_active);
   CREATE INDEX idx_video_content_featured ON video_content(is_featured);
   CREATE INDEX idx_video_content_language ON video_content(language);
   CREATE INDEX idx_video_content_tags ON video_content USING GIN(tags);
   
   -- Content categories indexes
   CREATE INDEX idx_content_categories_parent ON content_categories(parent_category_id);
   CREATE INDEX idx_content_categories_active ON content_categories(is_active);
   CREATE INDEX idx_content_categories_order ON content_categories(display_order);
   
   -- Content categorization indexes
   CREATE INDEX idx_content_categorization_video ON content_categorization(video_id);
   CREATE INDEX idx_content_categorization_category ON content_categorization(category_id);
   
   -- User content preferences indexes
   CREATE INDEX idx_user_content_preferences_user ON user_content_preferences(user_id);
   
   -- Content cache indexes
   CREATE INDEX idx_content_cache_user ON content_cache(user_id);
   CREATE INDEX idx_content_cache_status ON content_cache(cache_status);
   CREATE INDEX idx_content_cache_expires ON content_cache(expires_at);
   
   -- Content analytics indexes
   CREATE INDEX idx_content_analytics_user ON content_analytics(user_id);
   CREATE INDEX idx_content_analytics_video ON content_analytics(video_id);
   CREATE INDEX idx_content_analytics_event ON content_analytics(event_type);
   CREATE INDEX idx_content_analytics_timestamp ON content_analytics(event_timestamp);
   
   -- User content history indexes
   CREATE INDEX idx_user_content_history_user ON user_content_history(user_id);
   CREATE INDEX idx_user_content_history_video ON user_content_history(video_id);
   CREATE INDEX idx_user_content_history_watched ON user_content_history(last_watched_at);
   CREATE INDEX idx_user_content_history_favorite ON user_content_history(is_favorite);
   ```

3. **Create Content Management Functions**
   ```sql
   -- supabase/functions/content_functions.sql
   
   -- Function to get recommended videos for user
   CREATE OR REPLACE FUNCTION get_recommended_videos(
       p_user_id UUID,
       p_limit INTEGER DEFAULT 10
   )
   RETURNS TABLE (
       video_id UUID,
       title VARCHAR(255),
       description TEXT,
       thumbnail_url TEXT,
       duration_seconds INTEGER,
       content_type VARCHAR(50),
       difficulty_level VARCHAR(20),
       view_count INTEGER
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           vc.id,
           vc.title,
           vc.description,
           vc.thumbnail_url,
           vc.duration_seconds,
           vc.content_type,
           vc.difficulty_level,
           vc.view_count
       FROM video_content vc
       LEFT JOIN user_content_history uch ON vc.id = uch.video_id AND uch.user_id = p_user_id
       WHERE vc.is_active = true
           AND uch.id IS NULL  -- Not watched before
       ORDER BY vc.is_featured DESC, vc.view_count DESC, vc.created_at DESC
       LIMIT p_limit;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get user's favorite videos
   CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
   RETURNS TABLE (
       video_id UUID,
       title VARCHAR(255),
       thumbnail_url TEXT,
       last_watched_at TIMESTAMP WITH TIME ZONE,
       user_rating INTEGER
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           vc.id,
           vc.title,
           vc.thumbnail_url,
           uch.last_watched_at,
           uch.user_rating
       FROM user_content_history uch
       JOIN video_content vc ON uch.video_id = vc.id
       WHERE uch.user_id = p_user_id
           AND uch.is_favorite = true
           AND vc.is_active = true
       ORDER BY uch.last_watched_at DESC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get videos by category
   CREATE OR REPLACE FUNCTION get_videos_by_category(
       p_category_id UUID,
       p_limit INTEGER DEFAULT 20
   )
   RETURNS TABLE (
       video_id UUID,
       title VARCHAR(255),
       description TEXT,
       thumbnail_url TEXT,
       duration_seconds INTEGER,
       difficulty_level VARCHAR(20)
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           vc.id,
           vc.title,
           vc.description,
           vc.thumbnail_url,
           vc.duration_seconds,
           vc.difficulty_level
       FROM video_content vc
       JOIN content_categorization cc ON vc.id = cc.video_id
       WHERE cc.category_id = p_category_id
           AND vc.is_active = true
       ORDER BY vc.is_featured DESC, vc.view_count DESC
       LIMIT p_limit;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to record content analytics event
   CREATE OR REPLACE FUNCTION record_content_event(
       p_user_id UUID,
       p_video_id UUID,
       p_event_type VARCHAR(50),
       p_watch_duration_seconds INTEGER DEFAULT NULL,
       p_playback_position_seconds INTEGER DEFAULT NULL,
       p_device_info JSONB DEFAULT NULL,
       p_network_conditions JSONB DEFAULT NULL
   )
   RETURNS UUID AS $$
   DECLARE
       analytics_id UUID;
   BEGIN
       -- Record analytics event
       INSERT INTO content_analytics (
           user_id,
           video_id,
           event_type,
           event_timestamp,
           watch_duration_seconds,
           playback_position_seconds,
           device_info,
           network_conditions
       ) VALUES (
           p_user_id,
           p_video_id,
           p_event_type,
           NOW(),
           p_watch_duration_seconds,
           p_playback_position_seconds,
           p_device_info,
           p_network_conditions
       ) RETURNING id INTO analytics_id;
       
       -- Update user content history
       INSERT INTO user_content_history (
           user_id,
           video_id,
           last_watched_at,
           total_watch_time_seconds,
           watch_count
       ) VALUES (
           p_user_id,
           p_video_id,
           NOW(),
           COALESCE(p_watch_duration_seconds, 0),
           1
       ) ON CONFLICT (user_id, video_id) DO UPDATE SET
           last_watched_at = NOW(),
           total_watch_time_seconds = user_content_history.total_watch_time_seconds + COALESCE(p_watch_duration_seconds, 0),
           watch_count = user_content_history.watch_count + 1,
           updated_at = NOW();
       
       -- Update video view count for view events
       IF p_event_type = 'view' THEN
           UPDATE video_content 
           SET view_count = view_count + 1
           WHERE id = p_video_id;
       END IF;
       
       RETURN analytics_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Create Cache Management Functions**
   ```sql
   -- supabase/functions/cache_functions.sql
   
   -- Function to add video to cache queue
   CREATE OR REPLACE FUNCTION add_to_cache_queue(
       p_user_id UUID,
       p_video_id UUID,
       p_quality_level VARCHAR(20) DEFAULT 'medium'
   )
   RETURNS UUID AS $$
   DECLARE
       cache_id UUID;
   BEGIN
       INSERT INTO content_cache (
           user_id,
           video_id,
           cache_status,
           quality_level,
           expires_at
       ) VALUES (
           p_user_id,
           p_video_id,
           'pending',
           p_quality_level,
           NOW() + INTERVAL '7 days'
       ) ON CONFLICT (user_id, video_id) DO UPDATE SET
           cache_status = 'pending',
           quality_level = p_quality_level,
           expires_at = NOW() + INTERVAL '7 days',
           updated_at = NOW()
       RETURNING id INTO cache_id;
       
       RETURN cache_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to update cache status
   CREATE OR REPLACE FUNCTION update_cache_status(
       p_cache_id UUID,
       p_status VARCHAR(20),
       p_file_path TEXT DEFAULT NULL,
       p_file_size_bytes BIGINT DEFAULT NULL,
       p_error_message TEXT DEFAULT NULL
   )
   RETURNS BOOLEAN AS $$
   BEGIN
       UPDATE content_cache 
       SET 
           cache_status = p_status,
           file_path = p_file_path,
           file_size_bytes = p_file_size_bytes,
           error_message = p_error_message,
           download_completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE download_completed_at END,
           updated_at = NOW()
       WHERE id = p_cache_id;
       
       RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get user's cached videos
   CREATE OR REPLACE FUNCTION get_cached_videos(p_user_id UUID)
   RETURNS TABLE (
       cache_id UUID,
       video_id UUID,
       title VARCHAR(255),
       thumbnail_url TEXT,
       duration_seconds INTEGER,
       cache_status VARCHAR(20),
       file_size_bytes BIGINT,
       expires_at TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           cc.id,
           cc.video_id,
           vc.title,
           vc.thumbnail_url,
           vc.duration_seconds,
           cc.cache_status,
           cc.file_size_bytes,
           cc.expires_at
       FROM content_cache cc
       JOIN video_content vc ON cc.video_id = vc.id
       WHERE cc.user_id = p_user_id
           AND cc.cache_status = 'completed'
           AND cc.expires_at > NOW()
       ORDER BY cc.updated_at DESC;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to clean expired cache entries
   CREATE OR REPLACE FUNCTION clean_expired_cache()
   RETURNS INTEGER AS $$
   DECLARE
       affected_rows INTEGER;
   BEGIN
       UPDATE content_cache 
       SET cache_status = 'expired'
       WHERE expires_at < NOW() AND cache_status = 'completed';
       
       GET DIAGNOSTICS affected_rows = ROW_COUNT;
       RETURN affected_rows;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Insert Default Content Categories**
   ```sql
   -- Insert default content categories
   INSERT INTO content_categories (category_name, category_description, display_order, icon_name, color_hex) VALUES
   ('Cardio Training', 'Cardiovascular fitness exercises for mountain climbing', 1, 'heart', '#FF6B6B'),
   ('Strength Training', 'Strength building exercises for climbing', 2, 'dumbbell', '#4ECDC4'),
   ('Endurance Training', 'Endurance building workouts', 3, 'timer', '#45B7D1'),
   ('Technical Skills', 'Climbing technique and skills training', 4, 'climbing', '#96CEB4'),
   ('Safety & Preparation', 'Safety guidelines and preparation tips', 5, 'shield', '#FFEAA7'),
   ('Mental Preparation', 'Mental strength and motivation content', 6, 'brain', '#DDA0DD'),
   ('Altitude Training', 'High altitude preparation and acclimatization', 7, 'mountain', '#98D8C8'),
   ('Recovery & Nutrition', 'Recovery techniques and nutrition advice', 8, 'apple', '#F7DC6F'),
   ('Inspiration', 'Motivational and inspirational content', 9, 'star', '#BB8FCE'),
   ('Beginner Guides', 'Content for beginners starting their journey', 10, 'book', '#85C1E9');
   ```

6. **Create Updated At Triggers**
   ```sql
   -- Create triggers for updated_at columns
   CREATE TRIGGER update_video_content_updated_at BEFORE UPDATE ON video_content
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_user_content_preferences_updated_at BEFORE UPDATE ON user_content_preferences
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_content_cache_updated_at BEFORE UPDATE ON content_cache
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   
   CREATE TRIGGER update_user_content_history_updated_at BEFORE UPDATE ON user_content_history
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

**Key Implementation Details**:
- **Design Patterns**: Content management pattern, cache pattern, analytics pattern
- **Error Handling**: Comprehensive error handling for content operations
- **Data Validation**: Proper constraints and validation rules
- **Performance Considerations**: Efficient content delivery, strategic indexing

### Testing Requirements

**Unit Tests**:
- [ ] Content management function tests
- [ ] Cache management tests
- [ ] Analytics recording tests
- [ ] Recommendation algorithm tests

**Integration Tests**:
- [ ] Content delivery integration tests
- [ ] Cache lifecycle tests
- [ ] Analytics aggregation tests

**Manual Testing Steps**:
1. Test video content creation and management
2. Verify cache queue operations
3. Test content analytics recording
4. Validate recommendation system
5. Test content categorization

### Code Quality Standards

**Code Requirements**:
- [ ] Follow PostgreSQL best practices
- [ ] Use consistent naming conventions
- [ ] Implement proper data validation
- [ ] Add comprehensive comments
- [ ] Ensure data integrity

**Security Requirements**:
- [ ] User content isolation
- [ ] Secure file storage
- [ ] Content access validation
- [ ] Analytics privacy protection

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All content tables created and tested
- [ ] Functions and cache management implemented
- [ ] Content categories populated
- [ ] Analytics system working
- [ ] Cache management functional
- [ ] Integration testing passed

### Potential Challenges
**Known Risks**:
- Large file storage - Mitigation: Implement efficient storage strategies
- Cache management complexity - Mitigation: Use queue-based processing
- Analytics performance - Mitigation: Implement data aggregation

**Research Required**:
- Video content delivery optimization
- Cache management best practices
- Analytics data processing techniques

### Additional Resources
**Reference Materials**:
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Video Streaming Best Practices](https://developer.mozilla.org/en-US/docs/Web/Media)
- [PostgreSQL JSON Operations](https://www.postgresql.org/docs/current/functions-json.html)

**Related Code**:
- Core database schema from ST-MT-2-2
- Storage configuration from ST-MT-2-10
- RLS policies from ST-MT-2-7 