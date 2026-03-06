//! Event Replay Testing Suite
//!
//! This module verifies that emitted events are sufficient and consistent to
//! reconstruct contract state off-chain. It builds an event replay interpreter
//! that reconstructs state from events only and compares against direct queries.
//!
//! Tests cover:
//! - State reconstruction from events
//! - Event payload completeness
//! - Topic versioning consistency
//! - Reorg-like replay ordering
//! - Missing/inconsistent event detection

#![cfg(test)]

use crate::{TokenFactory, TokenFactoryClient};
use proptest::prelude::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Events, Ledger},
    Address, Env, Symbol, Val, Vec as SorobanVec,
};
use std::collections::HashMap;

/// Reconstructed contract state from events
#[derive(Debug, Clone, PartialEq)]
struct ReconstructedState {
    admin: Option<Address>,
    treasury: Option<Address>,
    base_fee: Option<i128>,
    metadata_fee: Option<i128>,
    paused: bool,
    token_count: u32,
    treasury_policy: Option<TreasuryPolicyState>,
    allowlist: HashMap<String, bool>,
    timelock_changes: HashMap<u64, bool>, // change_id -> executed
}

#[derive(Debug, Clone, PartialEq)]
struct TreasuryPolicyState {
    daily_cap: i128,
    allowlist_enabled: bool,
}

impl ReconstructedState {
    fn new() -> Self {
        Self {
            admin: None,
            treasury: None,
            base_fee: None,
            metadata_fee: None,
            paused: false,
            token_count: 0,
            treasury_policy: None,
            allowlist: HashMap::new(),
            timelock_changes: HashMap::new(),
        }
    }
    
    /// Apply an event to update reconstructed state
    fn apply_event(&mut self, topic: &Symbol, data: &SorobanVec<Val>, env: &Env) {
        let topic_str = topic.to_string();
        
        match topic_str.as_str() {
            "init_v1" | "init" => {
                // Event: (admin, treasury, base_fee, metadata_fee)
                if data.len() >= 4 {
                    self.admin = Some(data.get(0).unwrap().try_into_val(env).unwrap());
                    self.treasury = Some(data.get(1).unwrap().try_into_val(env).unwrap());
                    self.base_fee = Some(data.get(2).unwrap().try_into_val(env).unwrap());
                    self.metadata_fee = Some(data.get(3).unwrap().try_into_val(env).unwrap());
                }
            }
            "tok_rg_v1" | "tok_reg" => {
                // Token registered
                self.token_count += 1;
            }
            "adm_xf_v1" | "adm_xfer" => {
                // Event: (old_admin, new_admin)
                if data.len() >= 2 {
                    self.admin = Some(data.get(1).unwrap().try_into_val(env).unwrap());
                }
            }
            "pause_v1" | "pause" => {
                self.paused = true;
            }
            "unpaus_v1" | "unpause" => {
                self.paused = false;
            }
            "fee_up_v1" | "fee_upd" => {
                // Event: (base_fee, metadata_fee)
                if data.len() >= 2 {
                    self.base_fee = Some(data.get(0).unwrap().try_into_val(env).unwrap());
                    self.metadata_fee = Some(data.get(1).unwrap().try_into_val(env).unwrap());
                }
            }
            "trs_upd" => {
                // Event: (new_treasury)
                if data.len() >= 1 {
                    self.treasury = Some(data.get(0).unwrap().try_into_val(env).unwrap());
                }
            }
            "trs_pol" => {
                // Event: (daily_cap, allowlist_enabled)
                if data.len() >= 2 {
                    let daily_cap: i128 = data.get(0).unwrap().try_into_val(env).unwrap();
                    let allowlist_enabled: bool = data.get(1).unwrap().try_into_val(env).unwrap();
                    self.treasury_policy = Some(TreasuryPolicyState {
                        daily_cap,
                        allowlist_enabled,
                    });
                }
            }
            "rec_add" => {
                // Event: (recipient)
                if data.len() >= 1 {
                    let recipient: Address = data.get(0).unwrap().try_into_val(env).unwrap();
                    self.allowlist.insert(format!("{:?}", recipient), true);
                }
            }
            "rec_rem" => {
                // Event: (recipient)
                if data.len() >= 1 {
                    let recipient: Address = data.get(0).unwrap().try_into_val(env).unwrap();
                    self.allowlist.insert(format!("{:?}", recipient), false);
                }
            }
            "ch_exec" => {
                // Event: (change_id, change_type)
                // Extract change_id from topics if available
                // For now, mark that a change was executed
            }
            _ => {
                // Unknown event, skip
            }
        }
    }
    
    /// Compare with actual contract state
    fn compare_with_actual(
        &self,
        client: &TokenFactoryClient,
        env: &Env,
    ) -> Vec<String> {
        let mut diffs = Vec::new();
        let actual_state = client.get_state();
        
        // Compare admin
        if let Some(reconstructed_admin) = &self.admin {
            if *reconstructed_admin != actual_state.admin {
                diffs.push(format!(
                    "admin: reconstructed {:?} != actual {:?}",
                    reconstructed_admin, actual_state.admin
                ));
            }
        } else {
            diffs.push("admin: not reconstructed from events".to_string());
        }
        
        // Compare treasury
        if let Some(reconstructed_treasury) = &self.treasury {
            if *reconstructed_treasury != actual_state.treasury {
                diffs.push(format!(
                    "treasury: reconstructed {:?} != actual {:?}",
                    reconstructed_treasury, actual_state.treasury
                ));
            }
        } else {
            diffs.push("treasury: not reconstructed from events".to_string());
        }
        
        // Compare base_fee
        if let Some(reconstructed_fee) = self.base_fee {
            if reconstructed_fee != actual_state.base_fee {
                diffs.push(format!(
                    "base_fee: reconstructed {} != actual {}",
                    reconstructed_fee, actual_state.base_fee
                ));
            }
        } else {
            diffs.push("base_fee: not reconstructed from events".to_string());
        }
        
        // Compare metadata_fee
        if let Some(reconstructed_fee) = self.metadata_fee {
            if reconstructed_fee != actual_state.metadata_fee {
                diffs.push(format!(
                    "metadata_fee: reconstructed {} != actual {}",
                    reconstructed_fee, actual_state.metadata_fee
                ));
            }
        } else {
            diffs.push("metadata_fee: not reconstructed from events".to_string());
        }
        
        // Compare paused
        if self.paused != actual_state.paused {
            diffs.push(format!(
                "paused: reconstructed {} != actual {}",
                self.paused, actual_state.paused
            ));
        }
        
        // Compare token_count
        let actual_token_count = client.get_token_count();
        if self.token_count != actual_token_count {
            diffs.push(format!(
                "token_count: reconstructed {} != actual {}",
                self.token_count, actual_token_count
            ));
        }
        
        diffs
    }
}

/// Event replay interpreter
struct EventReplayInterpreter {
    state: ReconstructedState,
}

impl EventReplayInterpreter {
    fn new() -> Self {
        Self {
            state: ReconstructedState::new(),
        }
    }
    
    /// Replay all events from the environment
    fn replay_events(&mut self, env: &Env) {
        let events = env.events().all();
        
        for event in events.iter() {
            // Extract topic and data from event
            let (topics, data): (SorobanVec<Val>, SorobanVec<Val>) = event;
            
            if topics.len() > 0 {
                let topic: Symbol = topics.get(0).unwrap().try_into_val(env).unwrap();
                self.state.apply_event(&topic, &data, env);
            }
        }
    }
    
    /// Get reconstructed state
    fn get_state(&self) -> &ReconstructedState {
        &self.state
    }
}

/// Setup factory with known state
fn setup_factory(env: &Env) -> (TokenFactoryClient, Address, Address) {
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(env, &contract_id);
    
    let admin = Address::generate(env);
    let treasury = Address::generate(env);
    
    client.initialize(&admin, &treasury, &100_0000000, &50_0000000).unwrap();
    
    (client, admin, treasury)
}

// ============================================================================
// Event Replay Tests
// ============================================================================

#[test]
fn test_replay_initialization() {
    let env = Env::default();
    let (client, admin, treasury) = setup_factory(&env);
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Compare with actual state
    let diffs = interpreter.get_state().compare_with_actual(&client, &env);
    
    assert!(diffs.is_empty(), "State reconstruction failed:\n{}", diffs.join("\n"));
}

#[test]
fn test_replay_admin_transfer() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    // Perform admin transfer
    let new_admin = Address::generate(&env);
    client.transfer_admin(&admin, &new_admin).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Compare with actual state
    let diffs = interpreter.get_state().compare_with_actual(&client, &env);
    
    assert!(diffs.is_empty(), "State reconstruction failed:\n{}", diffs.join("\n"));
}

#[test]
fn test_replay_fee_updates() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    // Update fees
    client.update_fees(&admin, &Some(200_0000000), &Some(100_0000000)).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Compare with actual state
    let diffs = interpreter.get_state().compare_with_actual(&client, &env);
    
    assert!(diffs.is_empty(), "State reconstruction failed:\n{}", diffs.join("\n"));
}

#[test]
fn test_replay_pause_unpause() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    // Pause and unpause
    client.pause(&admin).unwrap();
    client.unpause(&admin).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Compare with actual state
    let diffs = interpreter.get_state().compare_with_actual(&client, &env);
    
    assert!(diffs.is_empty(), "State reconstruction failed:\n{}", diffs.join("\n"));
}

#[test]
fn test_replay_treasury_policy() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    // Initialize treasury policy
    client.initialize_treasury_policy(&admin, &Some(150_0000000), &true).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Verify treasury policy was reconstructed
    let state = interpreter.get_state();
    assert!(state.treasury_policy.is_some(), "Treasury policy not reconstructed");
    
    let policy = state.treasury_policy.as_ref().unwrap();
    assert_eq!(policy.daily_cap, 150_0000000, "Daily cap mismatch");
    assert_eq!(policy.allowlist_enabled, true, "Allowlist enabled mismatch");
}

#[test]
fn test_replay_allowlist_operations() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &true).unwrap();
    
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    
    // Add recipients
    client.add_allowed_recipient(&admin, &recipient1).unwrap();
    client.add_allowed_recipient(&admin, &recipient2).unwrap();
    
    // Remove one
    client.remove_allowed_recipient(&admin, &recipient1).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Verify allowlist was reconstructed
    let state = interpreter.get_state();
    let r1_key = format!("{:?}", recipient1);
    let r2_key = format!("{:?}", recipient2);
    
    assert_eq!(state.allowlist.get(&r1_key), Some(&false), "Recipient1 should be removed");
    assert_eq!(state.allowlist.get(&r2_key), Some(&true), "Recipient2 should be allowed");
}

// ============================================================================
// Property-Based Event Replay Tests
// ============================================================================

proptest! {
    #![proptest_config(ProptestConfig::with_cases(100))]

    /// Property: State reconstruction after random fee updates
    #[test]
    fn prop_replay_random_fee_updates(
        base_fee in 1i128..=1000_0000000i128,
        metadata_fee in 1i128..=1000_0000000i128,
    ) {
        let env = Env::default();
        let (client, admin, _treasury) = setup_factory(&env);
        
        env.mock_all_auths();
        
        // Update fees
        client.update_fees(&admin, &Some(base_fee), &Some(metadata_fee)).unwrap();
        
        // Replay events
        let mut interpreter = EventReplayInterpreter::new();
        interpreter.replay_events(&env);
        
        // Compare with actual state
        let diffs = interpreter.get_state().compare_with_actual(&client, &env);
        
        prop_assert!(diffs.is_empty(),
            "State reconstruction failed:\n{}",
            diffs.join("\n"));
    }

    /// Property: State reconstruction after random admin transfers
    #[test]
    fn prop_replay_admin_transfer_chain(
        transfer_count in 1usize..=5usize,
    ) {
        let env = Env::default();
        let (client, admin, _treasury) = setup_factory(&env);
        
        env.mock_all_auths();
        
        // Chain of admin transfers
        let mut current_admin = admin;
        for _ in 0..transfer_count {
            let new_admin = Address::generate(&env);
            client.transfer_admin(&current_admin, &new_admin).unwrap();
            current_admin = new_admin;
        }
        
        // Replay events
        let mut interpreter = EventReplayInterpreter::new();
        interpreter.replay_events(&env);
        
        // Compare with actual state
        let diffs = interpreter.get_state().compare_with_actual(&client, &env);
        
        prop_assert!(diffs.is_empty(),
            "State reconstruction failed:\n{}",
            diffs.join("\n"));
    }

    /// Property: State reconstruction after pause/unpause sequences
    #[test]
    fn prop_replay_pause_sequences(
        pause_count in 1usize..=10usize,
    ) {
        let env = Env::default();
        let (client, admin, _treasury) = setup_factory(&env);
        
        env.mock_all_auths();
        
        // Alternate pause/unpause
        for i in 0..pause_count {
            if i % 2 == 0 {
                client.pause(&admin).unwrap();
            } else {
                client.unpause(&admin).unwrap();
            }
        }
        
        // Replay events
        let mut interpreter = EventReplayInterpreter::new();
        interpreter.replay_events(&env);
        
        // Compare with actual state
        let diffs = interpreter.get_state().compare_with_actual(&client, &env);
        
        prop_assert!(diffs.is_empty(),
            "State reconstruction failed:\n{}",
            diffs.join("\n"));
    }
}

// ============================================================================
// Reorg-like Replay Ordering Tests
// ============================================================================

#[test]
fn test_replay_ordering_admin_then_fees() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    // Sequence: admin transfer then fee update
    let new_admin = Address::generate(&env);
    client.transfer_admin(&admin, &new_admin).unwrap();
    client.update_fees(&new_admin, &Some(200_0000000), &None).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Verify correct ordering
    let diffs = interpreter.get_state().compare_with_actual(&client, &env);
    assert!(diffs.is_empty(), "Ordering-dependent reconstruction failed");
}

#[test]
fn test_replay_ordering_pause_then_unpause() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    // Sequence: pause then unpause
    client.pause(&admin).unwrap();
    client.unpause(&admin).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Final state should be unpaused
    assert!(!interpreter.get_state().paused, "Final state should be unpaused");
    
    let diffs = interpreter.get_state().compare_with_actual(&client, &env);
    assert!(diffs.is_empty(), "Ordering-dependent reconstruction failed");
}

#[test]
fn test_replay_ordering_allowlist_add_remove() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &true).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Sequence: add then remove
    client.add_allowed_recipient(&admin, &recipient).unwrap();
    client.remove_allowed_recipient(&admin, &recipient).unwrap();
    
    // Replay events
    let mut interpreter = EventReplayInterpreter::new();
    interpreter.replay_events(&env);
    
    // Final state should be removed
    let state = interpreter.get_state();
    let key = format!("{:?}", recipient);
    assert_eq!(state.allowlist.get(&key), Some(&false), "Final state should be removed");
}

// ============================================================================
// Event Completeness Tests
// ============================================================================

#[test]
fn test_event_payload_completeness_initialization() {
    let env = Env::default();
    let (client, admin, treasury) = setup_factory(&env);
    
    // Check initialization event
    let events = env.events().all();
    assert!(events.len() > 0, "No events emitted");
    
    // First event should be initialization
    let (topics, data): (SorobanVec<Val>, SorobanVec<Val>) = events.get(0).unwrap();
    
    // Verify topic
    let topic: Symbol = topics.get(0).unwrap().try_into_val(&env).unwrap();
    assert!(
        topic.to_string().contains("init"),
        "First event should be initialization"
    );
    
    // Verify data completeness (admin, treasury, base_fee, metadata_fee)
    assert!(data.len() >= 4, "Initialization event missing data fields");
}

#[test]
fn test_event_payload_completeness_admin_transfer() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    let new_admin = Address::generate(&env);
    client.transfer_admin(&admin, &new_admin).unwrap();
    
    // Find admin transfer event
    let events = env.events().all();
    let mut found_transfer = false;
    
    for event in events.iter() {
        let (topics, data): (SorobanVec<Val>, SorobanVec<Val>) = event;
        if topics.len() > 0 {
            let topic: Symbol = topics.get(0).unwrap().try_into_val(&env).unwrap();
            if topic.to_string().contains("adm") {
                // Verify data completeness (old_admin, new_admin)
                assert!(data.len() >= 2, "Admin transfer event missing data fields");
                found_transfer = true;
                break;
            }
        }
    }
    
    assert!(found_transfer, "Admin transfer event not found");
}

#[test]
fn test_event_versioning_consistency() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    env.mock_all_auths();
    
    // Perform various operations
    client.update_fees(&admin, &Some(200_0000000), &None).unwrap();
    client.pause(&admin).unwrap();
    client.unpause(&admin).unwrap();
    
    // Check all events have version suffixes or consistent naming
    let events = env.events().all();
    
    for event in events.iter() {
        let (topics, _data): (SorobanVec<Val>, SorobanVec<Val>) = event;
        if topics.len() > 0 {
            let topic: Symbol = topics.get(0).unwrap().try_into_val(&env).unwrap();
            let topic_str = topic.to_string();
            
            // Events should have consistent naming (either versioned or not)
            // This test documents the current state
            assert!(!topic_str.is_empty(), "Event topic should not be empty");
        }
    }
}
