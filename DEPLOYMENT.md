# Triple eOS Backend Deployment Guide

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

**Option A: Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase/migrations/20240608000000_triple_eos_backend.sql`
4. Paste and run the SQL in the editor
5. Verify all tables are created successfully

**Option B: Supabase CLI**

```bash
# Install CLI
npm install -g supabase

# Link project (get project ref from Supabase dashboard)
supabase link --project-ref your_project_ref

# Push migration
supabase db push
```

### 3. Verify Setup

After running the migration, check that these tables exist in your Supabase dashboard:

- ✅ `health_check_questions` (20 rows)
- ✅ `health_check_responses` 
- ✅ `health_check_results`
- ✅ `system_archetypes` (3 rows)
- ✅ `archetype_detection_rules` (3 rows)
- ✅ `archetypes`
- ✅ `quick_wins`

### 4. Test the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and:

1. Sign up for a new account
2. Complete the health check assessment
3. View detected archetypes on the archetypes page
4. Manage quick wins

## Database Schema Overview

### Core Tables

```sql
-- Questions for health check (20 questions)
health_check_questions (id, dimension, category, text, tooltip)

-- User responses to questions
health_check_responses (id, user_id, question_id, response_value, comment)

-- Calculated dimension scores
health_check_results (id, user_id, dimension, average_score, color)

-- Master archetype definitions
system_archetypes (id, name, description, symptoms, leverage_points)

-- Rules for detecting archetypes
archetype_detection_rules (id, archetype_id, conditions)

-- User's detected archetypes
archetypes (id, user_id, archetype_name, source_dimension, insight)

-- Action items (system + user generated)
quick_wins (id, user_id, title, source, status, dimension)
```

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Proper authentication checks on all operations
- Foreign key constraints maintain data integrity

## Testing Archetype Detection

To test the archetype detection system, use these response patterns:

### Shifting the Burden Pattern
- Question 10 (Decision Making): Score 1-2
- Question 17 (Learning): Score 1-2
- Other questions: Score 3-4

### Erosion of Goals Pattern  
- Questions 1-3 (Process): Score 1-2
- Question 8 (Goals): Score 1-2
- Other questions: Score 3-4

### Fixes that Fail Pattern
- Question 15 (Innovation): Score 4-5
- Questions 1-3 (Process): Score 1-2
- Other questions: Score 3-4

## API Endpoints

### POST /api/archetypes
Detects archetypes based on health check responses and generates quick wins.

**Request:**
```json
{
  "healthCheckResultId": "uuid",
  "responses": [
    {
      "dimension": "Efficiency",
      "category": "Process", 
      "score": 2,
      "comment": "Optional comment"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "archetypes": [
    {
      "archetype_name": "Shifting the Burden",
      "source_dimension": "Effectiveness",
      "insight": "Pattern description and recommendations"
    }
  ],
  "message": "Detected 1 archetype(s)"
}
```

### GET /api/archetypes
Fetches user's detected archetypes and quick wins.

**Response:**
```json
{
  "archetypes": [...],
  "quickWins": [...]
}
```

## Troubleshooting

### Common Issues

1. **"Column category does not exist"**
   - Solution: Run the migration again, ensure it completes successfully

2. **"No archetypes detected"**
   - Check that response scores match detection rule patterns
   - Verify the detection function is working correctly

3. **"Unauthorized" errors**
   - Verify user is authenticated
   - Check RLS policies are correctly applied

4. **Migration fails**
   - Ensure you have proper permissions in Supabase
   - Try running the SQL manually in the dashboard

### Debug Steps

1. Check Supabase logs in the dashboard
2. Verify all tables were created with correct schema
3. Test API endpoints directly using browser dev tools
4. Check browser console for JavaScript errors

## Production Deployment

### Environment Variables

For production, set these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Performance Considerations

- Database indexes are optimized for user-based queries
- RLS policies ensure data isolation
- UUID primary keys support horizontal scaling
- Connection pooling handled by Supabase

### Monitoring

- Use Supabase dashboard for query performance monitoring
- Set up alerts for error rates and response times
- Monitor database usage and scaling needs

## Success Checklist

- ✅ Supabase project created and configured
- ✅ Environment variables set correctly
- ✅ Database migration completed successfully
- ✅ All 7 tables created with proper schema
- ✅ Sample data seeded (20 questions, 3 archetypes)
- ✅ Authentication working (sign up, login, logout)
- ✅ Health check assessment saves responses
- ✅ Archetype detection identifies patterns
- ✅ Quick wins generated and manageable
- ✅ RLS policies protect user data

The Triple eOS backend is now fully deployed and operational! 