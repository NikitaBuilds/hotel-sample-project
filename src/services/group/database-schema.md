# Group Travel Booking Database

## Goal

Enable friends to collaboratively plan, vote on, and book group trips together.

## Tables

**`users`** - User profiles extending Supabase Auth  
**`groups`** - Trip planning sessions with dates and selected hotels  
**`group_members`** - Many-to-many user-group relationships with roles  
**`invitations`** - Email-based group invites with expiration tracking  
**`votes`** - Democratic hotel selection with upvote/downvote system  
**`messages`** - Real-time group chat for trip coordination

## Key Features

- **Group Management** - Create trips, invite friends, assign roles
- **Democratic Voting** - Vote on hotels, auto-select winner when voting closes
- **Real-time Chat** - Coordinate plans with group messaging
- **Smart Invitations** - Email invites that work for non-users
- **Trip Lifecycle** - Planning → Voting → Booked → Completed

-- Create ENUM types
CREATE TYPE group_status AS ENUM ('planning', 'voting', 'voting_closed', 'booked', 'completed', 'cancelled');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE message_type AS ENUM ('text', 'system', 'hotel_share', 'vote_update');

-- Users table (extends Supabase Auth)
CREATE TABLE users (
id uuid PRIMARY KEY,
email text UNIQUE NOT NULL,
full_name text NOT NULL,
avatar_url text,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- Groups table
CREATE TABLE groups (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
description text,
check_in_date date NOT NULL,
check_out_date date NOT NULL,
max_members integer DEFAULT 5,
status group_status DEFAULT 'planning',
selected_hotel_id text,
selected_hotel_data jsonb,
created_by uuid REFERENCES users(id) ON DELETE CASCADE,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now(),

CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
CONSTRAINT selected_hotel_when_closed CHECK (
(status IN ('voting_closed', 'booked', 'completed') AND selected_hotel_id IS NOT NULL) OR
(status IN ('planning', 'voting', 'cancelled'))
)
);

-- Group members table
CREATE TABLE group_members (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
user_id uuid REFERENCES users(id) ON DELETE CASCADE,
role member_role DEFAULT 'member',
joined_at timestamptz DEFAULT now(),

UNIQUE(group_id, user_id)
);

-- Invitations table
CREATE TABLE invitations (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
invited_by uuid REFERENCES users(id) ON DELETE CASCADE,
invited_email text NOT NULL,
invited_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
status invitation_status DEFAULT 'pending',
expires_at timestamptz DEFAULT (now() + interval '7 days'),
responded_at timestamptz,
created_at timestamptz DEFAULT now()
);

-- Votes table
CREATE TABLE votes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
user_id uuid REFERENCES users(id) ON DELETE CASCADE,
hotel_id text NOT NULL,
hotel_name text NOT NULL,
hotel_data jsonb,
is_upvote boolean NOT NULL,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now(),

UNIQUE(group_id, user_id, hotel_id)
);

-- Messages table
CREATE TABLE messages (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
user_id uuid REFERENCES users(id) ON DELETE CASCADE,
content text NOT NULL,
message_type message_type DEFAULT 'text',
metadata jsonb,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_votes_group_id ON votes(group_id);
CREATE INDEX idx_votes_hotel_id ON votes(hotel_id);
CREATE INDEX idx_messages_group_id_created_at ON messages(group_id, created_at);
CREATE INDEX idx_invitations_email_status ON invitations(invited_email, status);
CREATE INDEX idx_groups_created_by ON groups(created_by);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;

$$
language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user record when someone signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS
$$

BEGIN
INSERT INTO public.users (id, email, full_name, avatar_url)
VALUES (
NEW.id,
NEW.email,
COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
NEW.raw_user_meta_data->>'avatar_url'
);
RETURN NEW;
END;

$$
language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
$$
