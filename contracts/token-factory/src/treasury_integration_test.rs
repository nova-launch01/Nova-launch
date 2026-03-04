use crate::{TokenFactory, TokenFactoryClient};
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup() -> (Env, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    
    // Initialize factory
    client.initialize(&admin, &treasury, &100_0000000, &50_0000000).unwrap();
    
    (env, contract_id, admin, treasury)
}

#[test]
fn test_initialize_treasury_policy() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    // Initialize with 50 XLM cap and allowlist enabled
    client.initialize_treasury_policy(&admin, &Some(50_0000000), &true).unwrap();
    
    let policy = client.get_treasury_policy();
    assert_eq!(policy.daily_cap, 50_0000000);
    assert!(policy.allowlist_enabled);
}

#[test]
fn test_withdraw_within_cap() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Withdraw 50 XLM - should succeed
    client.withdraw_fees(&admin, &recipient, &50_0000000).unwrap();
    
    let remaining = client.get_remaining_capacity();
    assert_eq!(remaining, 50_0000000);
}

#[test]
#[should_panic(expected = "WithdrawalCapExceeded")]
fn test_withdraw_exceeds_cap() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Try to withdraw 150 XLM - should fail
    client.withdraw_fees(&admin, &recipient, &150_0000000).unwrap();
}

#[test]
fn test_withdraw_exact_cap() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Withdraw exactly 100 XLM - should succeed
    client.withdraw_fees(&admin, &recipient, &100_0000000).unwrap();
    
    let remaining = client.get_remaining_capacity();
    assert_eq!(remaining, 0);
}

#[test]
fn test_multiple_withdrawals_within_cap() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // First withdrawal: 40 XLM
    client.withdraw_fees(&admin, &recipient, &40_0000000).unwrap();
    assert_eq!(client.get_remaining_capacity(), 60_0000000);
    
    // Second withdrawal: 30 XLM
    client.withdraw_fees(&admin, &recipient, &30_0000000).unwrap();
    assert_eq!(client.get_remaining_capacity(), 30_0000000);
    
    // Third withdrawal: 20 XLM
    client.withdraw_fees(&admin, &recipient, &20_0000000).unwrap();
    assert_eq!(client.get_remaining_capacity(), 10_0000000);
}

#[test]
#[should_panic(expected = "WithdrawalCapExceeded")]
fn test_multiple_withdrawals_exceed_cap() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // First withdrawal: 80 XLM
    client.withdraw_fees(&admin, &recipient, &80_0000000).unwrap();
    
    // Second withdrawal: 30 XLM - should fail (total would be 110)
    client.withdraw_fees(&admin, &recipient, &30_0000000).unwrap();
}

#[test]
fn test_period_reset() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Withdraw 80 XLM
    client.withdraw_fees(&admin, &recipient, &80_0000000).unwrap();
    assert_eq!(client.get_remaining_capacity(), 20_0000000);
    
    // Advance time by 24 hours + 1 second
    env.ledger().with_mut(|li| {
        li.timestamp = li.timestamp + 86_401;
    });
    
    // Should have full capacity again
    assert_eq!(client.get_remaining_capacity(), 100_0000000);
    
    // Should be able to withdraw 80 XLM again
    client.withdraw_fees(&admin, &recipient, &80_0000000).unwrap();
    assert_eq!(client.get_remaining_capacity(), 20_0000000);
}

#[test]
#[should_panic(expected = "RecipientNotAllowed")]
fn test_allowlist_enforced() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    // Enable allowlist
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &true).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Try to withdraw to non-allowed recipient - should fail
    client.withdraw_fees(&admin, &recipient, &50_0000000).unwrap();
}

#[test]
fn test_allowlist_add_and_withdraw() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    // Enable allowlist
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &true).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Add recipient to allowlist
    client.add_allowed_recipient(&admin, &recipient).unwrap();
    assert!(client.is_allowed_recipient(&recipient));
    
    // Should succeed now
    client.withdraw_fees(&admin, &recipient, &50_0000000).unwrap();
    assert_eq!(client.get_remaining_capacity(), 50_0000000);
}

#[test]
fn test_allowlist_remove() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &true).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Add recipient
    client.add_allowed_recipient(&admin, &recipient).unwrap();
    assert!(client.is_allowed_recipient(&recipient));
    
    // Remove recipient
    client.remove_allowed_recipient(&admin, &recipient).unwrap();
    assert!(!client.is_allowed_recipient(&recipient));
}

#[test]
fn test_update_treasury_policy_cap() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    // Update daily cap to 200 XLM
    client.update_treasury_policy(&admin, &Some(200_0000000), &None).unwrap();
    
    let policy = client.get_treasury_policy();
    assert_eq!(policy.daily_cap, 200_0000000);
    assert!(!policy.allowlist_enabled);
}

#[test]
fn test_update_treasury_policy_allowlist() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    // Enable allowlist
    client.update_treasury_policy(&admin, &None, &Some(true)).unwrap();
    
    let policy = client.get_treasury_policy();
    assert_eq!(policy.daily_cap, 100_0000000);
    assert!(policy.allowlist_enabled);
}

#[test]
fn test_update_treasury_policy_both() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    // Update both cap and allowlist
    client.update_treasury_policy(&admin, &Some(150_0000000), &Some(true)).unwrap();
    
    let policy = client.get_treasury_policy();
    assert_eq!(policy.daily_cap, 150_0000000);
    assert!(policy.allowlist_enabled);
}

#[test]
#[should_panic(expected = "InvalidAmount")]
fn test_zero_amount_rejected() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Try to withdraw 0 - should fail
    client.withdraw_fees(&admin, &recipient, &0).unwrap();
}

#[test]
#[should_panic(expected = "InvalidAmount")]
fn test_negative_amount_rejected() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Try to withdraw negative amount - should fail
    client.withdraw_fees(&admin, &recipient, &(-100)).unwrap();
}

#[test]
#[should_panic(expected = "Unauthorized")]
fn test_non_admin_cannot_withdraw() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let non_admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    
    // Try to withdraw as non-admin - should fail
    client.withdraw_fees(&non_admin, &recipient, &50_0000000).unwrap();
}

#[test]
#[should_panic(expected = "Unauthorized")]
fn test_non_admin_cannot_add_recipient() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &true).unwrap();
    
    let non_admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    
    // Try to add recipient as non-admin - should fail
    client.add_allowed_recipient(&non_admin, &recipient).unwrap();
}

#[test]
#[should_panic(expected = "Unauthorized")]
fn test_non_admin_cannot_update_policy() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let non_admin = Address::generate(&env);
    
    // Try to update policy as non-admin - should fail
    client.update_treasury_policy(&non_admin, &Some(200_0000000), &None).unwrap();
}

#[test]
fn test_default_policy_values() {
    let (env, _contract_id, _admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    // Get policy without initializing (should use defaults)
    let policy = client.get_treasury_policy();
    assert_eq!(policy.daily_cap, 100_0000000); // 100 XLM default
    assert!(!policy.allowlist_enabled);
    assert_eq!(policy.period_duration, 86_400); // 24 hours
}

#[test]
fn test_remaining_capacity_after_period_reset() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient = Address::generate(&env);
    
    // Withdraw 100 XLM (full cap)
    client.withdraw_fees(&admin, &recipient, &100_0000000).unwrap();
    assert_eq!(client.get_remaining_capacity(), 0);
    
    // Advance time by 24 hours
    env.ledger().with_mut(|li| {
        li.timestamp = li.timestamp + 86_400;
    });
    
    // Should have full capacity again
    assert_eq!(client.get_remaining_capacity(), 100_0000000);
}

#[test]
#[should_panic(expected = "InvalidParameters")]
fn test_negative_cap_rejected() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    // Try to initialize with negative cap - should fail
    client.initialize_treasury_policy(&admin, &Some(-100), &false).unwrap();
}

#[test]
fn test_allowlist_disabled_allows_any_recipient() {
    let (env, _contract_id, admin, _treasury) = setup();
    let client = TokenFactoryClient::new(&env, &_contract_id);
    
    // Allowlist disabled
    client.initialize_treasury_policy(&admin, &Some(100_0000000), &false).unwrap();
    
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    
    // Both should succeed without being added to allowlist
    client.withdraw_fees(&admin, &recipient1, &30_0000000).unwrap();
    client.withdraw_fees(&admin, &recipient2, &40_0000000).unwrap();
    
    assert_eq!(client.get_remaining_capacity(), 30_0000000);
}
