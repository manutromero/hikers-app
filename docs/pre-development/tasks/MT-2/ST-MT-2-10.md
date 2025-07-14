## Sub-Task MT-2.10: Storage Buckets and Real-time Setup

### Objective
Configure Supabase storage buckets for media files, user uploads, and implement real-time subscriptions for live data updates in the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 2 - Supabase Backend Setup and Database Schema](../main-tasks-mountain-climber-training-app.md#task-2-supabase-backend-setup-and-database-schema)
**Context**: This implements the storage and real-time infrastructure layer for file management and live data synchronization.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: Medium
**Developer Type**: Backend/Infrastructure

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-2-6 (Content and Media Management Tables)
- [ ] ST-MT-2-9 (OAuth Providers Configuration)
- [ ] Supabase project fully configured

**Outputs Needed By**:
- Task 3 (Authentication System Implementation)
- Task 4 (Core Features Implementation)

### Acceptance Criteria
- [ ] Storage buckets created and configured
- [ ] File upload policies implemented
- [ ] Real-time subscriptions configured
- [ ] Storage security policies implemented
- [ ] File management functions created
- [ ] Real-time channels configured
- [ ] Storage testing completed
- [ ] Real-time testing completed

### Technical Implementation

**Architecture Context**:
This sub-task implements the infrastructure layer of the hexagonal architecture for file storage and real-time data synchronization.

**Files to Create/Modify**:
```
supabase/
├── storage/
│   ├── buckets/
│   │   ├── user-avatars.sql
│   │   ├── training-videos.sql
│   │   ├── mountain-images.sql
│   │   └── app-assets.sql
│   └── policies/
│       └── storage_policies.sql
├── realtime/
│   ├── channels.sql
│   └── subscriptions.sql
└── functions/
    └── storage_functions.sql
```

**Step-by-Step Implementation**:

1. **Create Storage Buckets Configuration**
   ```sql
   -- supabase/storage/buckets/user-avatars.sql
   
   -- User avatars bucket
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
       'user-avatars',
       'user-avatars',
       true,
       5242880, -- 5MB limit
       ARRAY['image/jpeg', 'image/png', 'image/webp']
   ) ON CONFLICT (id) DO UPDATE SET
       public = EXCLUDED.public,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;
   
   -- supabase/storage/buckets/training-videos.sql
   
   -- Training videos bucket
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
       'training-videos',
       'training-videos',
       false,
       104857600, -- 100MB limit
       ARRAY['video/mp4', 'video/webm', 'video/quicktime']
   ) ON CONFLICT (id) DO UPDATE SET
       public = EXCLUDED.public,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;
   
   -- supabase/storage/buckets/mountain-images.sql
   
   -- Mountain images bucket
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
       'mountain-images',
       'mountain-images',
       true,
       10485760, -- 10MB limit
       ARRAY['image/jpeg', 'image/png', 'image/webp']
   ) ON CONFLICT (id) DO UPDATE SET
       public = EXCLUDED.public,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;
   
   -- supabase/storage/buckets/app-assets.sql
   
   -- App assets bucket
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
       'app-assets',
       'app-assets',
       true,
       5242880, -- 5MB limit
       ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
   ) ON CONFLICT (id) DO UPDATE SET
       public = EXCLUDED.public,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;
   ```

2. **Create Storage Security Policies**
   ```sql
   -- supabase/storage/policies/storage_policies.sql
   
   -- User avatars policies
   CREATE POLICY "Users can view their own avatar" ON storage.objects
       FOR SELECT USING (
           bucket_id = 'user-avatars' AND 
           auth.uid()::text = (storage.foldername(name))[1]
       );
   
   CREATE POLICY "Users can upload their own avatar" ON storage.objects
       FOR INSERT WITH CHECK (
           bucket_id = 'user-avatars' AND 
           auth.uid()::text = (storage.foldername(name))[1]
       );
   
   CREATE POLICY "Users can update their own avatar" ON storage.objects
       FOR UPDATE USING (
           bucket_id = 'user-avatars' AND 
           auth.uid()::text = (storage.foldername(name))[1]
       );
   
   CREATE POLICY "Users can delete their own avatar" ON storage.objects
       FOR DELETE USING (
           bucket_id = 'user-avatars' AND 
           auth.uid()::text = (storage.foldername(name))[1]
       );
   
   -- Training videos policies
   CREATE POLICY "Authenticated users can view training videos" ON storage.objects
       FOR SELECT USING (
           bucket_id = 'training-videos' AND 
           auth.role() = 'authenticated'
       );
   
   CREATE POLICY "Premium users can upload training videos" ON storage.objects
       FOR INSERT WITH CHECK (
           bucket_id = 'training-videos' AND 
           has_role(auth.uid(), 'premium_user')
       );
   
   CREATE POLICY "Video owners can update their videos" ON storage.objects
       FOR UPDATE USING (
           bucket_id = 'training-videos' AND 
           auth.uid()::text = (storage.foldername(name))[1]
       );
   
   CREATE POLICY "Video owners can delete their videos" ON storage.objects
       FOR DELETE USING (
           bucket_id = 'training-videos' AND 
           auth.uid()::text = (storage.foldername(name))[1]
       );
   
   -- Mountain images policies
   CREATE POLICY "Anyone can view mountain images" ON storage.objects
       FOR SELECT USING (bucket_id = 'mountain-images');
   
   CREATE POLICY "Admins can upload mountain images" ON storage.objects
       FOR INSERT WITH CHECK (
           bucket_id = 'mountain-images' AND 
           has_role(auth.uid(), 'admin')
       );
   
   CREATE POLICY "Admins can update mountain images" ON storage.objects
       FOR UPDATE USING (
           bucket_id = 'mountain-images' AND 
           has_role(auth.uid(), 'admin')
       );
   
   CREATE POLICY "Admins can delete mountain images" ON storage.objects
       FOR DELETE USING (
           bucket_id = 'mountain-images' AND 
           has_role(auth.uid(), 'admin')
       );
   
   -- App assets policies
   CREATE POLICY "Anyone can view app assets" ON storage.objects
       FOR SELECT USING (bucket_id = 'app-assets');
   
   CREATE POLICY "Admins can manage app assets" ON storage.objects
       FOR ALL USING (
           bucket_id = 'app-assets' AND 
           has_role(auth.uid(), 'admin')
       );
   ```

3. **Create Storage Management Functions**
   ```sql
   -- supabase/functions/storage_functions.sql
   
   -- Function to get user avatar URL
   CREATE OR REPLACE FUNCTION get_user_avatar_url(user_id UUID)
   RETURNS TEXT AS $$
   DECLARE
       avatar_url TEXT;
   BEGIN
       SELECT storage.url('user-avatars', 'avatars/' || user_id || '/avatar.jpg')
       INTO avatar_url;
       
       RETURN avatar_url;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to upload user avatar
   CREATE OR REPLACE FUNCTION upload_user_avatar(
       p_user_id UUID,
       p_file_data BYTEA,
       p_file_name TEXT,
       p_content_type TEXT
   )
   RETURNS TEXT AS $$
   DECLARE
       file_path TEXT;
       file_url TEXT;
   BEGIN
       -- Generate file path
       file_path := 'avatars/' || p_user_id || '/' || p_file_name;
       
       -- Upload file to storage
       INSERT INTO storage.objects (bucket_id, name, owner, metadata)
       VALUES (
           'user-avatars',
           file_path,
           p_user_id,
           jsonb_build_object(
               'contentType', p_content_type,
               'size', octet_length(p_file_data)
           )
       );
       
       -- Get file URL
       SELECT storage.url('user-avatars', file_path) INTO file_url;
       
       -- Update user profile with avatar URL
       UPDATE user_profiles 
       SET profile_image_url = file_url
       WHERE id = p_user_id;
       
       RETURN file_url;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to delete user avatar
   CREATE OR REPLACE FUNCTION delete_user_avatar(p_user_id UUID)
   RETURNS BOOLEAN AS $$
   BEGIN
       -- Delete file from storage
       DELETE FROM storage.objects 
       WHERE bucket_id = 'user-avatars' 
           AND name LIKE 'avatars/' || p_user_id || '/%';
       
       -- Update user profile
       UPDATE user_profiles 
       SET profile_image_url = NULL
       WHERE id = p_user_id;
       
       RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to get file metadata
   CREATE OR REPLACE FUNCTION get_file_metadata(
       p_bucket_id TEXT,
       p_file_path TEXT
   )
   RETURNS TABLE (
       file_name TEXT,
       file_size BIGINT,
       content_type TEXT,
       created_at TIMESTAMP WITH TIME ZONE,
       updated_at TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
       RETURN QUERY
       SELECT 
           o.name::TEXT,
           (o.metadata->>'size')::BIGINT as file_size,
           o.metadata->>'contentType' as content_type,
           o.created_at,
           o.updated_at
       FROM storage.objects o
       WHERE o.bucket_id = p_bucket_id
           AND o.name = p_file_path;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Create Real-time Configuration**
   ```sql
   -- supabase/realtime/channels.sql
   
   -- Enable real-time for specific tables
   ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
   ALTER PUBLICATION supabase_realtime ADD TABLE training_plans;
   ALTER PUBLICATION supabase_realtime ADD TABLE training_sessions;
   ALTER PUBLICATION supabase_realtime ADD TABLE wearable_data;
   ALTER PUBLICATION supabase_realtime ADD TABLE readiness_scores;
   ALTER PUBLICATION supabase_realtime ADD TABLE video_content;
   ALTER PUBLICATION supabase_realtime ADD TABLE content_analytics;
   
   -- Create real-time channels table
   CREATE TABLE realtime_channels (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       channel_name VARCHAR(255) NOT NULL UNIQUE,
       table_name VARCHAR(255),
       event_types TEXT[] DEFAULT ARRAY['INSERT', 'UPDATE', 'DELETE'],
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Insert default real-time channels
   INSERT INTO realtime_channels (channel_name, table_name, event_types) VALUES
   ('user_profiles', 'user_profiles', ARRAY['UPDATE']),
   ('training_plans', 'training_plans', ARRAY['INSERT', 'UPDATE', 'DELETE']),
   ('training_sessions', 'training_sessions', ARRAY['INSERT', 'UPDATE', 'DELETE']),
   ('wearable_data', 'wearable_data', ARRAY['INSERT']),
   ('readiness_scores', 'readiness_scores', ARRAY['INSERT', 'UPDATE']),
   ('video_content', 'video_content', ARRAY['INSERT', 'UPDATE']),
   ('content_analytics', 'content_analytics', ARRAY['INSERT']);
   ```

5. **Create Real-time Subscription Functions**
   ```sql
   -- supabase/realtime/subscriptions.sql
   
   -- Function to subscribe to user-specific channel
   CREATE OR REPLACE FUNCTION subscribe_to_user_channel(user_id UUID)
   RETURNS TEXT AS $$
   DECLARE
       channel_name TEXT;
   BEGIN
       channel_name := 'user_' || user_id;
       
       -- Create user-specific channel if it doesn't exist
       INSERT INTO realtime_channels (channel_name, table_name, event_types)
       VALUES (channel_name, 'user_data', ARRAY['INSERT', 'UPDATE', 'DELETE'])
       ON CONFLICT (channel_name) DO NOTHING;
       
       RETURN channel_name;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to subscribe to training updates
   CREATE OR REPLACE FUNCTION subscribe_to_training_updates(user_id UUID)
   RETURNS TEXT AS $$
   DECLARE
       channel_name TEXT;
   BEGIN
       channel_name := 'training_' || user_id;
       
       -- Create training-specific channel
       INSERT INTO realtime_channels (channel_name, table_name, event_types)
       VALUES (channel_name, 'training_data', ARRAY['INSERT', 'UPDATE', 'DELETE'])
       ON CONFLICT (channel_name) DO NOTHING;
       
       RETURN channel_name;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to broadcast training session update
   CREATE OR REPLACE FUNCTION broadcast_training_update(
       p_user_id UUID,
       p_session_id UUID,
       p_update_type TEXT
   )
   RETURNS BOOLEAN AS $$
   BEGIN
       -- This would typically be handled by the application layer
       -- For now, we'll just return success
       RETURN true;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

6. **Create Storage Triggers**
   ```sql
   -- Create triggers for file management
   
   -- Trigger to update user profile when avatar is uploaded
   CREATE OR REPLACE FUNCTION handle_avatar_upload()
   RETURNS TRIGGER AS $$
   BEGIN
       IF NEW.bucket_id = 'user-avatars' THEN
           UPDATE user_profiles 
           SET profile_image_url = storage.url('user-avatars', NEW.name)
           WHERE id::text = (storage.foldername(NEW.name))[1];
       END IF;
       
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER avatar_upload_trigger
       AFTER INSERT ON storage.objects
       FOR EACH ROW EXECUTE FUNCTION handle_avatar_upload();
   
   -- Trigger to clean up user profile when avatar is deleted
   CREATE OR REPLACE FUNCTION handle_avatar_deletion()
   RETURNS TRIGGER AS $$
   BEGIN
       IF OLD.bucket_id = 'user-avatars' THEN
           UPDATE user_profiles 
           SET profile_image_url = NULL
           WHERE id::text = (storage.foldername(OLD.name))[1];
       END IF;
       
       RETURN OLD;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER avatar_deletion_trigger
       AFTER DELETE ON storage.objects
       FOR EACH ROW EXECUTE FUNCTION handle_avatar_deletion();
   ```

7. **Create Storage Indexes**
   ```sql
   -- Storage objects indexes
   CREATE INDEX idx_storage_objects_bucket ON storage.objects(bucket_id);
   CREATE INDEX idx_storage_objects_owner ON storage.objects(owner);
   CREATE INDEX idx_storage_objects_created_at ON storage.objects(created_at);
   
   -- Real-time channels indexes
   CREATE INDEX idx_realtime_channels_name ON realtime_channels(channel_name);
   CREATE INDEX idx_realtime_channels_active ON realtime_channels(is_active);
   CREATE INDEX idx_realtime_channels_table ON realtime_channels(table_name);
   ```

8. **Create Updated At Triggers**
   ```sql
   -- Create triggers for updated_at columns
   CREATE TRIGGER update_realtime_channels_updated_at BEFORE UPDATE ON realtime_channels
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

**Key Implementation Details**:
- **Design Patterns**: Storage pattern, real-time pattern, event-driven pattern
- **Error Handling**: Comprehensive file upload error handling
- **Data Validation**: File type and size validation
- **Performance Considerations**: Efficient file storage and real-time updates

### Testing Requirements

**Unit Tests**:
- [ ] Storage bucket configuration tests
- [ ] File upload/download tests
- [ ] Storage policy tests
- [ ] Real-time subscription tests

**Integration Tests**:
- [ ] End-to-end file management tests
- [ ] Real-time data synchronization tests
- [ ] Storage security validation tests

**Manual Testing Steps**:
1. Test storage bucket creation
2. Verify file upload policies
3. Test real-time subscriptions
4. Validate storage security
5. Test file management functions

### Code Quality Standards

**Code Requirements**:
- [ ] Follow Supabase storage best practices
- [ ] Use secure file handling
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Ensure data integrity

**Security Requirements**:
- [ ] Secure file storage policies
- [ ] File access validation
- [ ] Real-time channel security
- [ ] User data protection

### Definition of Done
- [ ] Implementation completed according to acceptance criteria
- [ ] All storage buckets created and configured
- [ ] Security policies implemented
- [ ] Real-time channels configured
- [ ] File management functions working
- [ ] Integration testing passed
- [ ] Documentation updated

### Potential Challenges
**Known Risks**:
- File size limitations - Mitigation: Implement proper file size validation
- Storage costs - Mitigation: Use efficient storage strategies
- Real-time performance - Mitigation: Optimize subscription patterns

**Research Required**:
- Supabase storage optimization
- Real-time performance best practices
- File management strategies

### Additional Resources
**Reference Materials**:
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)

**Related Code**:
- Content management from ST-MT-2-6
- OAuth configuration from ST-MT-2-9
- Authentication system from Task 3 