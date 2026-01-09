# Migration: Fix Reviews Table Schema

The `reviews` table is missing the critical `status` column required for the approval workflow.

## 1. Run SQL in Supabase Dashboard

Go to your Supabase Project -> **SQL Editor** -> **New Query** and run:

```sql
-- Add status column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create an index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- Update existing reviews (if any) to have a status
UPDATE public.reviews SET status = 'pending' WHERE status IS NULL;
```

## 2. Verify

After running the SQL, try submitting a review again. The error "Could not find the 'status' column" should be gone.
