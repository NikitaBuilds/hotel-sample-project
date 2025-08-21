# Voting Service

## Overview

A democratic hotel voting system for ski trip planning, allowing group members to vote on preferred accommodations with weighted votes.

## Key Features

- **Weighted Voting**: Cast votes with different weights (1-3 stars) to express preference strength
- **Real-time Leaderboard**: Live-updating hotel rankings based on weighted scores
- **Vote Management**: Add, change, and remove votes with immediate feedback
- **One Vote Per Hotel**: Users can only have one active vote per hotel
- **Responsive UI**: Clean interface with loading states and toast notifications

## Architecture

### Frontend Components

- `HotelVoteCard`: Individual hotel card with voting controls
- `VotingHeader`: Page header with group info and admin controls
- `VotingStats`: Statistics display showing vote counts and status
- `EmptyVotingState`: Placeholder for when no hotels are available

### React Query Hooks

- `useVotingResultsLive`: Real-time polling for vote results (15s interval)
- `useCastVote`: Cast or change votes with optimistic updates
- `useRemoveVote`: Remove existing votes
- `useCloseVoting`: Admin function to end voting and select winner

### API Routes

- `GET /api/groups/[id]/votes/results`: Fetch voting results and rankings
- `POST /api/groups/[id]/votes`: Cast a vote for a hotel
- `DELETE /api/votes/[id]`: Remove a specific vote
- `POST /api/groups/[id]/votes/close`: Close voting and select winner

## Data Model

- **Vote**: `{ id, group_id, user_id, hotel_id, hotel_name, is_upvote, weight, ... }`
- **VoteWeight**: `"1" | "2" | "3"` (star ratings)
- **HotelVoteSummary**: Hotel with aggregated vote data and user votes

## Usage Flow

1. Browse hotels in the Explore section
2. Vote for preferred hotels with 1-3 star weights
3. View real-time leaderboard to see group preferences
4. Change or remove votes as needed
5. Admin closes voting to select the winning hotel

## Technical Notes

- Deduplication to prevent React key errors
- Immediate refetching after mutations
- Loading states for all operations
