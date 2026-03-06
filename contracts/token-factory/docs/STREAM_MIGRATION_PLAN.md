# Stream Feature Migration Plan

## Overview

This document outlines the safe rollout strategy for introducing stream storage keys and APIs to the Token Factory contract. The migration is designed to be **non-breaking** and **backward-compatible** with all existing token functionality.

## Migration Strategy

### Phase 1: Storage Key Additions (Non-Breaking)

**Objective**: Add new storage keys for stream functionality without affecting existing keys.

**New Storage Keys:**

```rust
pub enum DataKey {
    // ═══════════════════════════════════════════════════════
    // EXISTING KEYS (UNCHANGED - DO NOT MODIFY)
    // ═══════════════════════════════════════════════════════
    Admin,
    Treasury,
    BaseFee,
    MetadataFee,
    TokenCount,
    Token(u32),
    Balance(u32, Address),
    BurnCount(u32),
    TokenPaused(u32),
    TotalBurned(u32),
    TokenByAddress(Address),
    Paused,
    TimelockConfig,
    PendingChange(u64),
    NextChangeId,
    CreatorTokens(Address),
    CreatorTokenCount(Address),
    TreasuryPolicy,
    WithdrawalPeriod,
    AllowedRecipient(Address),
    
    // ═══════════════════════════════════════════════════════
    // NEW KEYS FOR STREAM FEATURE (PHASE 1)
    // ═══════════════════════════════════════════════════════
    StreamCount,                        // Total number of streams created
    Stream(u32),                        // Stream info by stream ID
    StreamStatus(u32),                  // Stream status (Created/Claimed/Cancelled)
    CreatorStreamCount(Address),        // Number of streams created by address
    CreatorStream(Address, u32),        // Stream ID for creator at index
    RecipientStreamCount(Address),      // Number of streams for recipient
    RecipientStream(Address, u32),      // Stream ID for recipient at index
}
```

**Safety Guarantees:**
- ✅ No existing keys are modified or removed
- ✅ New keys use distinct namespaces (Stream*, Creator*, Recipient*)
- ✅ No overlap with existing key patterns
- ✅ Existing storage reads/writes remain unchanged

### Phase 2: API Additions (Non-Breaking)

**Objective**: Add new stream functions without modifying existing token APIs.

**New Functions:**

```rust
// Stream creation
pub fn create_stream(
    env: Env,
    creator: Address,
    token_index: u32,
    recipient: Address,
    amount: i128,
    metadata: Option<String>,
) -> Result<u32, Error>

// Stream claiming
pub fn claim_stream(
    env: Env,
    recipient: Address,
    stream_id: u32,
) -> Result<(), Error>

// Stream cancellation
pub fn cancel_stream(
    env: Env,
    creator: Address,
    stream_id: u32,
) -> Result<(), Error>

// Stream queries
pub fn get_stream_info(env: Env, stream_id: u32) -> Result<StreamInfo, Error>
pub fn get_stream_count(env: Env) -> u32
pub fn get_streams_by_creator(env: Env, creator: Address, limit: u32) -> Vec<u32>
pub fn get_streams_by_recipient(env: Env, recipient: Address, limit: u32) -> Vec<u32>
```

**Safety Guarantees:**
- ✅ All new functions (no modifications to existing functions)
- ✅ Existing token APIs remain unchanged
- ✅ No changes to function signatures of existing APIs
- ✅ No changes to existing error codes (new errors use codes 21+)

### Phase 3: Event Schema Additions (Non-Breaking)

**Objective**: Add new event types without affecting existing events.

**New Events:**

```rust
// Stream created event
pub fn emit_stream_created(
    env: &Env,
    stream_id: u32,
    creator: &Address,
    recipient: &Address,
    amount: i128,
    has_metadata: bool,
)

// Stream claimed event
pub fn emit_stream_claimed(
    env: &Env,
    stream_id: u32,
    recipient: &Address,
    amount: i128,
)

// Stream cancelled event
pub fn emit_stream_cancelled(
    env: &Env,
    stream_id: u32,
    creator: &Address,
    refund_amount: i128,
)
```

**Safety Guarantees:**
- ✅ New event names (strm_cr_v1, strm_cl_v1, strm_cn_v1)
- ✅ No modifications to existing event schemas
- ✅ Existing event indexers continue working unchanged
- ✅ New events follow versioning convention

## Backward Compatibility Verification

### Existing Token APIs (Must Remain Unchanged)

| Function | Status | Verification |
|----------|--------|--------------|
| `initialize` | ✅ Unchanged | Compatibility test |
| `create_token` | ✅ Unchanged | Compatibility test |
| `get_token_info` | ✅ Unchanged | Compatibility test |
| `get_token_count` | ✅ Unchanged | Compatibility test |
| `get_state` | ✅ Unchanged | Compatibility test |
| `transfer_admin` | ✅ Unchanged | Compatibility test |
| `pause` / `unpause` | ✅ Unchanged | Compatibility test |
| `update_fees` | ✅ Unchanged | Compatibility test |
| `burn` | ✅ Unchanged | Compatibility test |
| `admin_burn` | ✅ Unchanged | Compatibility test |
| `batch_burn` | ✅ Unchanged | Compatibility test |
| `set_clawback` | ✅ Unchanged | Compatibility test |

### Storage Isolation

**Principle**: Stream storage keys are completely isolated from token storage keys.

**Verification:**
- Stream keys use distinct prefixes (Stream*, Creator*, Recipient*)
- Token keys remain unchanged (Token, Balance, BurnCount, etc.)
- No shared state between streams and tokens
- Independent counters (TokenCount vs StreamCount)

## Migration Testing Strategy

### 1. Compatibility Tests

**Location**: `src/stream_compatibility_test.rs`

**Purpose**: Verify existing token APIs work identically before and after stream feature addition.

**Test Cases:**
- ✅ Token creation works with stream keys present
- ✅ Token queries return same results
- ✅ Burn operations work unchanged
- ✅ Admin operations work unchanged
- ✅ Fee operations work unchanged
- ✅ Pause operations work unchanged
- ✅ Events emit correctly for token operations

### 2. Smoke Tests

**Location**: `src/stream_smoke_test.rs`

**Purpose**: Verify mixed old/new state reads work correctly.

**Test Scenarios:**
- ✅ Read token info when streams exist
- ✅ Read stream info when tokens exist
- ✅ Create token after creating streams
- ✅ Create stream after creating tokens
- ✅ Burn tokens while streams are active
- ✅ Query both tokens and streams in same transaction

### 3. Isolation Tests

**Location**: `src/stream_isolation_test.rs`

**Purpose**: Verify stream operations don't affect token state.

**Test Cases:**
- ✅ Stream creation doesn't modify token count
- ✅ Stream claiming doesn't affect token balances (except intended transfer)
- ✅ Stream cancellation doesn't affect token state
- ✅ Stream queries don't interfere with token queries

## Rollout Phases

### Phase 1: Storage Keys (Week 1)

**Actions:**
1. Add new DataKey variants to `types.rs`
2. Add storage helper functions in `storage.rs`
3. Run compatibility tests
4. Verify no regressions

**Success Criteria:**
- ✅ All existing tests pass
- ✅ Compatibility tests pass
- ✅ No changes to existing storage reads/writes

### Phase 2: Core Functions (Week 2)

**Actions:**
1. Implement `create_stream` function
2. Implement `claim_stream` function
3. Implement `cancel_stream` function
4. Add unit tests for new functions
5. Run compatibility tests

**Success Criteria:**
- ✅ New functions work correctly
- ✅ All existing tests still pass
- ✅ Compatibility tests pass
- ✅ Smoke tests pass

### Phase 3: Query Functions (Week 3)

**Actions:**
1. Implement `get_stream_info`
2. Implement `get_stream_count`
3. Implement creator/recipient query functions
4. Add integration tests
5. Run full test suite

**Success Criteria:**
- ✅ Query functions work correctly
- ✅ All tests pass (existing + new)
- ✅ Isolation tests pass

### Phase 4: Events & Backend (Week 4)

**Actions:**
1. Add event emission functions
2. Update backend event parser
3. Add backend tests
4. Run end-to-end tests

**Success Criteria:**
- ✅ Events emit correctly
- ✅ Backend indexes events
- ✅ Full integration works

## Risk Mitigation

### Risk 1: Storage Key Collision

**Mitigation:**
- Use distinct key prefixes (Stream*, Creator*, Recipient*)
- Add collision detection tests
- Review all existing keys before adding new ones

**Verification:**
```rust
#[test]
fn test_no_storage_key_collision() {
    // Verify Stream(0) != Token(0)
    // Verify StreamCount != TokenCount
    // etc.
}
```

### Risk 2: Function Signature Changes

**Mitigation:**
- Only add new functions, never modify existing ones
- Use separate module for stream functions if needed
- Maintain strict API versioning

**Verification:**
- Compatibility tests verify existing function signatures
- Compilation errors if signatures change

### Risk 3: Event Schema Conflicts

**Mitigation:**
- Use versioned event names (strm_cr_v1, etc.)
- Follow existing event naming convention
- Test event emission in isolation

**Verification:**
- Event emission tests
- Backend parser tests

### Risk 4: State Inconsistency

**Mitigation:**
- Use atomic operations for state updates
- Implement rollback on errors
- Add state validation tests

**Verification:**
- Integration tests with error scenarios
- Property tests for invariants

## Rollback Plan

### If Issues Detected

**Phase 1 Rollback:**
- Remove new DataKey variants
- Revert storage.rs changes
- No data loss (no streams created yet)

**Phase 2 Rollback:**
- Disable new functions (return Error::NotImplemented)
- Keep storage keys (no harm if unused)
- No data loss if no streams created

**Phase 3+ Rollback:**
- Disable new functions
- Existing streams remain in storage (can be accessed later)
- Token operations continue normally

## Monitoring & Validation

### Pre-Deployment Checklist

- [ ] All compatibility tests pass
- [ ] All smoke tests pass
- [ ] All isolation tests pass
- [ ] No existing test failures
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Backend integration tested

### Post-Deployment Monitoring

- Monitor token creation rate (should be unchanged)
- Monitor token query performance (should be unchanged)
- Monitor burn operations (should be unchanged)
- Monitor stream creation rate (new metric)
- Monitor error rates for new functions

### Success Metrics

**Week 1:**
- 0 regressions in existing token tests
- 100% compatibility test pass rate

**Week 2:**
- 0 regressions in existing token operations
- >90% unit test coverage for new functions

**Week 3:**
- 0 regressions in existing queries
- >90% integration test coverage

**Week 4:**
- 0 regressions in event indexing
- Successful end-to-end stream workflow

## Documentation Updates

### Required Documentation

1. **API Documentation**
   - Add stream function signatures to API docs
   - Document new error codes
   - Document new event schemas

2. **Developer Guide**
   - Update quick reference with stream examples
   - Add stream usage patterns
   - Document migration from old to new

3. **Testing Guide**
   - Document compatibility test requirements
   - Add smoke test examples
   - Update testing matrix

## Conclusion

This migration plan ensures a **safe, non-breaking rollout** of the stream feature by:

1. ✅ Adding new storage keys without modifying existing ones
2. ✅ Adding new functions without changing existing APIs
3. ✅ Adding new events without affecting existing event schemas
4. ✅ Comprehensive testing at each phase
5. ✅ Clear rollback procedures
6. ✅ Continuous monitoring and validation

**Key Principle**: Existing token functionality must work identically before and after stream feature deployment.

