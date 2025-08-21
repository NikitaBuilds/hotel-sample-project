# Hotels Sample Project

**Live Demo:** [https://hotel-sample-project.vercel.app/dashboard/hotels](https://hotel-sample-project.vercel.app/dashboard/hotels)

Group trip planning application with voting system and hotel search integration.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- React Query (TanStack Query)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth)
- LiteAPI integration

## Services Architecture

```
src/services/
├── group/
│   ├── management/     # CRUD operations for groups
│   ├── invitations/    # Email-based group invites
│   ├── voting/         # Weighted hotel voting system
│   ├── chat/           # Real-time group messaging
│   └── hooks/          # Active group state management
├── lite/
│   ├── hotels/         # Hotel search and details
│   └── types/          # LiteAPI response types
└── supabase/
    └── use-user.tsx    # Auth context provider
```

## Service Details

### Group Management Service

**Location:** `src/services/group/management/`

- `useGroups()` - Paginated list of user's groups
- `useGroupDetails(groupId)` - Single group with members
- `useCreateGroup()` - Creates new group, auto-adds creator as owner
- `useUpdateGroup(groupId)` - Updates group details, status transitions
- `useDeleteGroup()` - Removes group and all related data

**Group Status Flow:** `planning` → `voting` → `voting_closed` → `booked` → `completed`

### Invitations Service

**Location:** `src/services/group/invitations/`

- `useSendInvitation()` - Sends email invite with 7-day expiration
- `useGroupInvitations(groupId)` - Lists group's sent invitations
- `useUserInvitations()` - Lists invitations received by current user
- `useAcceptInvitation(inviteId)` - Adds user to group, updates invitation status
- `useRejectInvitation(inviteId)` - Marks invitation as rejected

Email invites work for non-registered users. Invitation links redirect to signup if needed.

### Voting Service

**Location:** `src/services/group/voting/`

- `useVotingResults(groupId)` - Real-time vote tallies with hotel rankings
- `useCastVote(groupId)` - Submit weighted vote (1-3 points) for hotel
- `useUpdateVote(voteId)` - Change existing vote weight or direction
- `useCloseVoting(groupId)` - Admin-only, selects winning hotel, transitions group to `voting_closed`

Voting system supports upvotes/downvotes with configurable weights. Optimistic updates for immediate UI feedback.

### Chat Service

**Location:** `src/services/group/chat/`

- `useGroupMessages(groupId)` - Paginated message history
- `useSendMessage(groupId)` - Send text/system messages
- `useDeleteMessage()` - Remove messages (owner/admin only)
- `useGroupMessagesLive(groupId)` - Polls every 5 seconds for new messages

Message types: `text`, `system`, `hotel_share`, `vote_update`

### LiteAPI Hotels Service

**Location:** `src/services/lite/hotels/`

- `useHotelSearch(searchRequest)` - POST to `/api/lite/hotels/rates`
- `useHotelDetails(hotelId)` - GET `/api/lite/hotel/{id}`
- `useHotelReviews(hotelId)` - GET `/api/lite/reviews/{hotelId}`
- `useCountries()`, `useCities(countryCode)`, `useFacilities()` - Metadata endpoints

Includes ski-specific filtering and caching strategies based on data volatility.

## React Query Caching Strategy

Different TTLs based on data update frequency:

- **Hotels**: 10min stale, 30min cache
- **Voting**: 30sec stale, 2min cache (real-time needed)
- **Messages**: 10sec stale, 2min cache (near real-time)
- **Groups**: 5min stale, 15min cache
- **Metadata** (countries, facilities): 24hr stale, 7-day cache

Optimistic updates on voting and messaging for immediate UI feedback.

## Database Schema (PostgreSQL)

### Core Tables

**`users`** - Extends Supabase Auth

```sql
id uuid PRIMARY KEY,
email text UNIQUE NOT NULL,
full_name text NOT NULL,
avatar_url text,
created_at timestamptz DEFAULT now()
```

**`groups`** - Trip planning sessions

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL,
description text,
check_in_date date NOT NULL,
check_out_date date NOT NULL,
max_members integer DEFAULT 5,
status group_status DEFAULT 'planning',
selected_hotel_id text,
selected_hotel_data jsonb,
created_by uuid REFERENCES users(id)
```

**`group_members`** - User-group relationships

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
user_id uuid REFERENCES users(id) ON DELETE CASCADE,
role member_role DEFAULT 'member',
joined_at timestamptz DEFAULT now(),
UNIQUE(group_id, user_id)
```

**`invitations`** - Email-based group invites

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
invited_by uuid REFERENCES users(id) ON DELETE CASCADE,
invited_email text NOT NULL,
invited_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
status invitation_status DEFAULT 'pending',
expires_at timestamptz DEFAULT (now() + interval '7 days')
```

**`votes`** - Weighted hotel voting

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
user_id uuid REFERENCES users(id) ON DELETE CASCADE,
hotel_id text NOT NULL,
hotel_name text NOT NULL,
hotel_data jsonb,
is_upvote boolean NOT NULL,
weight vote_weight NOT NULL, -- '1', '2', or '3'
UNIQUE(group_id, user_id, hotel_id)
```

**`messages`** - Group chat

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
user_id uuid REFERENCES users(id) ON DELETE CASCADE,
content text NOT NULL,
message_type message_type DEFAULT 'text',
metadata jsonb
```

### ENUM Types

```sql
CREATE TYPE group_status AS ENUM ('planning', 'voting', 'voting_closed', 'booked', 'completed', 'cancelled');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE message_type AS ENUM ('text', 'system', 'hotel_share', 'vote_update');
```

## App Routes

- `/dashboard` - Main dashboard with active group overview
- `/dashboard/hotels` - Hotel search with LiteAPI integration
- `/dashboard/hotels/[hotel-id]` - Individual hotel details
- `/dashboard/vote` - Voting interface with real-time tallies
- `/dashboard/chat` - Group messaging
- `/dashboard/group-settings` - Group management
- `/dashboard/profile/my-invitations` - User invitations

## Screenshots

![Group Creation Interface](https://pwvnpmcilolvunpzulbe.supabase.co/storage/v1/object/public/readme/Screenshot%202025-08-21%20at%2005.45.58.png)

![Voting Leaderboard](https://pwvnpmcilolvunpzulbe.supabase.co/storage/v1/object/public/readme/Screenshot%202025-08-21%20at%2005.45.29.png)

![Chat Interface](https://pwvnpmcilolvunpzulbe.supabase.co/storage/v1/object/public/readme/Screenshot%202025-08-21%20at%2005.45.14.png)

![Hotel Explore Page](https://pwvnpmcilolvunpzulbe.supabase.co/storage/v1/object/public/readme/Screenshot%202025-08-21%20at%2005.44.53.png)
