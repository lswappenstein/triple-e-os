# Triple eOS - Complete Backend Implementation

A comprehensive SaaS platform implementing the Triple E Model (Efficiency, Effectiveness, Excellence) with health check assessments, system archetype detection, and quick wins generation.

## 🏗️ Backend Architecture

This implementation provides a complete, clean backend infrastructure using Supabase with the following features:

### ✅ Core Features Implemented

- **Authentication System**: Complete sign up, login, logout with Supabase Auth
- **Health Check Diagnosis**: 20-question survey across 3 dimensions
- **System Archetype Detection**: Automated pattern recognition based on responses
- **Quick Wins Generation**: System-generated and user-created action items
- **Row Level Security**: All data properly secured per user
- **Clean Database**: Single migration file, no legacy tables

### 📊 Database Schema

#### Core Tables

1. **health_check_questions** - Survey questions (20 questions)
   - `id` (SERIAL, PK)
   - `dimension` (Efficiency/Effectiveness/Excellence)
   - `category` (Process, Goals, Innovation, etc.)
   - `text` (Question text)
   - `tooltip` (Explanatory text)

2. **health_check_responses** - User responses
   - `id` (UUID, PK)
   - `user_id` (UUID, FK to auth.users)
   - `question_id` (INTEGER, FK)
   - `response_value` (1-5 scale)
   - `comment` (Optional text)

3. **health_check_results** - Calculated scores
   - `id` (UUID, PK)
   - `user_id` (UUID, FK)
   - `dimension` (Efficiency/Effectiveness/Excellence)
   - `average_score` (FLOAT)
   - `color` (Green/Yellow/Red)

4. **system_archetypes** - Master archetype definitions
   - `id` (UUID, PK)
   - `name` (Archetype name)
   - `description` (Detailed description)
   - `symptoms` (Array of symptoms)
   - `leverage_points` (Array of solutions)

5. **archetype_detection_rules** - Detection logic
   - `id` (UUID, PK)
   - `archetype_id` (UUID, FK)
   - `conditions` (JSONB rules)

6. **archetypes** - User-detected archetypes
   - `id` (UUID, PK)
   - `user_id` (UUID, FK)
   - `archetype_name` (Detected archetype)
   - `source_dimension` (Primary dimension)
   - `insight` (Generated insight)

7. **quick_wins** - Action items
   - `id` (UUID, PK)
   - `user_id` (UUID, FK)
   - `title` (Action title)
   - `source` (system/user)
   - `status` (To Do/In Progress/Done)
   - `dimension` (Efficiency/Effectiveness/Excellence)

### 🔒 Security Implementation

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Questions and system archetypes readable by all authenticated users
- Proper foreign key constraints and data validation

### 🎯 Archetype Detection System

The system includes 3 pre-configured archetypes:

1. **Shifting the Burden** - Detected when Decision Making (Effectiveness) and Learning (Excellence) scores are low
2. **Erosion of Goals** - Detected when Process (Efficiency) and Goals (Effectiveness) scores are low  
3. **Fixes that Fail** - Detected when Innovation (Excellence) is high but Process (Efficiency) is low

## 🚀 Deployment Instructions

### Prerequisites

- Supabase account and project
- Node.js 18+ installed
- Environment variables configured

### Step 1: Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Database Migration

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase/migrations/20240608000000_triple_eos_backend.sql`
4. Paste and run the SQL in the editor

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your_project_ref

# Push migration
supabase db push
```

### Step 3: Verify Database Setup

After running the migration, verify these tables exist:
- `health_check_questions` (20 rows)
- `health_check_responses` 
- `health_check_results`
- `system_archetypes` (3 rows)
- `archetype_detection_rules` (3 rows)
- `archetypes`
- `quick_wins`

### Step 4: Application Deployment

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build for production
npm run build
npm start
```

## 🔄 Data Flow

### Health Check Process

1. **User takes assessment** → 20 questions across 3 dimensions
2. **Responses saved** → `health_check_responses` table
3. **Scores calculated** → Dimension averages saved to `health_check_results`
4. **Archetypes detected** → Database function evaluates detection rules
5. **Quick wins generated** → System creates action items based on detected archetypes

### Archetype Detection Logic

The system uses a PostgreSQL function `detect_archetypes_for_user()` that:
- Evaluates user responses against detection rules
- Identifies matching archetype patterns
- Returns detected archetypes with insights
- Automatically generates quick wins

## 📱 Frontend Integration

### Health Check Page (`/dashboard/health-check`)
- 20-question survey with 1-5 scale responses
- Progress tracking and validation
- Automatic archetype detection on submission

### Archetypes Page (`/dashboard/archetypes`)
- Displays detected archetypes with insights
- Shows quick wins table with status management
- Color-coded by dimension and status

### API Endpoints

- `POST /api/archetypes` - Detect and save archetypes
- `GET /api/archetypes` - Fetch user's archetypes and quick wins

## 🧪 Testing the System

### Test the Complete Flow

1. **Sign up** for a new account
2. **Complete health check** with varied responses:
   - Low scores (1-2) in Decision Making and Learning → Should detect "Shifting the Burden"
   - Low scores in Process and Goals → Should detect "Erosion of Goals"  
   - High Innovation (4-5) + Low Process (1-2) → Should detect "Fixes that Fail"
3. **View archetypes page** to see detected patterns
4. **Manage quick wins** by updating status

### Sample Test Responses

For testing archetype detection, try these response patterns:

**Shifting the Burden Pattern:**
- Question 10 (Decision Making): Score 2
- Question 17 (Learning): Score 2
- Other questions: Score 3-4

**Erosion of Goals Pattern:**
- Questions 1-3 (Process): Score 2
- Question 8 (Goals): Score 2  
- Other questions: Score 3-4

## 🔧 Customization

### Adding New Archetypes

1. Insert into `system_archetypes` table
2. Add detection rules to `archetype_detection_rules`
3. Update the detection function logic if needed

### Modifying Questions

1. Update `health_check_questions` table
2. Ensure frontend questions array matches database
3. Update detection rules if categories change

## 📋 Database Maintenance

### Indexes Created
- User-based indexes for performance
- Question and response relationship indexes
- Status-based indexes for quick wins

### Triggers
- Automatic `last_updated` timestamp updates on quick wins

## 🚨 Troubleshooting

### Common Issues

1. **"Column category does not exist"** → Run the migration again
2. **"No archetypes detected"** → Check response scores match detection rules
3. **"Unauthorized"** → Verify user authentication and RLS policies

### Debug Steps

1. Check Supabase logs in dashboard
2. Verify migration ran completely
3. Test API endpoints directly
4. Check browser console for errors

## 📈 Production Considerations

- **Performance**: Indexes are optimized for user-based queries
- **Security**: RLS policies prevent cross-user data access
- **Scalability**: UUID primary keys support horizontal scaling
- **Monitoring**: Use Supabase dashboard for query performance

## 🎉 Success Criteria

✅ **Authentication**: Users can sign up, login, logout  
✅ **Health Check**: 20-question survey saves responses  
✅ **Archetype Detection**: Patterns automatically identified  
✅ **Quick Wins**: System generates and users can manage action items  
✅ **Security**: All data properly isolated per user  
✅ **Clean Database**: Single migration, no legacy tables  

The backend is now complete and ready for production use!
