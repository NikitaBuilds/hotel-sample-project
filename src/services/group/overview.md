# Group Management Service Overview

## Core Functionality

Collaborative trip planning with friends - groups, invitations, voting, and chat.

## Group Management API

### Groups

- `POST /api/groups` → Create new trip group
- `GET /api/groups` → List user's groups
- `GET /api/groups/[id]` → Get group details
- `PATCH /api/groups/[id]` → Update group (dates, name, status)
- `DELETE /api/groups/[id]` → Delete group (owner only)

### Group Membership

- `GET /api/groups/[id]/members` → List group members
- `POST /api/groups/[id]/members` → Add member (invitation accepted)
- `PATCH /api/groups/[id]/members/[userId]` → Update member role
- `DELETE /api/groups/[id]/members/[userId]` → Remove member

### Invitations

- `POST /api/groups/[id]/invitations` → Send invitation
- `GET /api/groups/[id]/invitations` → List group invitations
- `POST /api/invitations/[id]/accept` → Accept invitation
- `POST /api/invitations/[id]/reject` → Reject invitation
- `DELETE /api/invitations/[id]` → Cancel invitation

### Voting System

- `GET /api/groups/[id]/votes` → Get voting results
- `POST /api/groups/[id]/votes` → Cast vote on hotel
- `PATCH /api/groups/[id]/votes/[voteId]` → Update vote
- `DELETE /api/groups/[id]/votes/[voteId]` → Remove vote
- `POST /api/groups/[id]/voting/close` → Close voting & select winner

### Group Chat

- `GET /api/groups/[id]/messages` → Get chat messages (paginated)
- `POST /api/groups/[id]/messages` → Send message
- `PATCH /api/messages/[id]` → Edit message
- `DELETE /api/messages/[id]` → Delete message

## React Query Hooks Structure

### Group Hooks (`useGroups.ts`)

```typescript
useGroups(); // List user's groups
useGroupDetails(groupId); // Single group with members
useCreateGroup(); // Mutation: create group
useUpdateGroup(groupId); // Mutation: update group
useDeleteGroup(groupId); // Mutation: delete group
```

### Membership Hooks (`useMembers.ts`)

```typescript
useGroupMembers(groupId); // List group members
useAddMember(groupId); // Mutation: add member
useUpdateMemberRole(groupId); // Mutation: change role
useRemoveMember(groupId); // Mutation: remove member
```

### Invitation Hooks (`useInvitations.ts`)

```typescript
useGroupInvitations(groupId); // List group invitations
useSendInvitation(groupId); // Mutation: send invitation
useAcceptInvitation(); // Mutation: accept invitation
useRejectInvitation(); // Mutation: reject invitation
useCancelInvitation(); // Mutation: cancel invitation
```

### Voting Hooks (`useVoting.ts`)

```typescript
useGroupVotes(groupId); // Get voting results & tallies
useCastVote(groupId); // Mutation: vote on hotel
useUpdateVote(groupId); // Mutation: change vote
useRemoveVote(groupId); // Mutation: remove vote
useCloseVoting(groupId); // Mutation: close voting & select winner
useVotingResults(groupId); // Real-time voting results
```

### Chat Hooks (`useChat.ts`)

```typescript
useGroupMessages(groupId, page?) // Paginated messages
useSendMessage(groupId) // Mutation: send message
useEditMessage() // Mutation: edit message
useDeleteMessage() // Mutation: delete message
useMessageSubscription(groupId) // Real-time message updates
```

## Key Types

**Groups**: `Group`, `GroupStatus`, `GroupMember`, `MemberRole`  
**Invitations**: `Invitation`, `InvitationStatus`  
**Voting**: `Vote`, `VotingResults`, `HotelVoteSummary`  
**Chat**: `Message`, `MessageType`, `MessageMetadata`  
**API**: `GroupAPIResponse<T>`, `GroupAPIError`, `PaginatedResponse<T>`

## Caching Strategy

**Groups**: 5min stale, 15min cache - moderate updates  
**Members**: 10min stale, 30min cache - infrequent changes  
**Invitations**: 2min stale, 5min cache - status changes quickly  
**Votes**: 30sec stale, 2min cache - real-time updates needed  
**Messages**: 1min stale, 5min cache - frequent updates
