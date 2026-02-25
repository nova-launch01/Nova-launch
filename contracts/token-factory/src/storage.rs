use soroban_sdk::{Address, Env};

use crate::types::{DataKey, FactoryState, TokenInfo};

// Admin management
pub fn get_admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

// Treasury management
pub fn get_treasury(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Treasury).unwrap()
}

pub fn set_treasury(env: &Env, treasury: &Address) {
    env.storage().instance().set(&DataKey::Treasury, treasury);
}

// Fee management
pub fn get_base_fee(env: &Env) -> i128 {
    env.storage().instance().get(&DataKey::BaseFee).unwrap()
}

pub fn set_base_fee(env: &Env, fee: i128) {
    env.storage().instance().set(&DataKey::BaseFee, &fee);
}

pub fn get_metadata_fee(env: &Env) -> i128 {
    env.storage().instance().get(&DataKey::MetadataFee).unwrap()
}

pub fn set_metadata_fee(env: &Env, fee: i128) {
    env.storage().instance().set(&DataKey::MetadataFee, &fee);
}

// Token registry
pub fn get_token_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::TokenCount)
        .unwrap_or(0)
}

pub fn get_token_info(env: &Env, index: u32) -> Option<TokenInfo> {
    env.storage().instance().get(&DataKey::Token(index))
}

pub fn set_token_info(env: &Env, index: u32, info: &TokenInfo) {
    env.storage().instance().set(&DataKey::Token(index), info);
}

pub fn increment_token_count(env: &Env) -> u32 {
    let count = get_token_count(env) + 1;
    env.storage().instance().set(&DataKey::TokenCount, &count);
    count
}

// Get factory state
pub fn get_factory_state(env: &Env) -> FactoryState {
    FactoryState {
        admin: get_admin(env),
        treasury: get_treasury(env),
        base_fee: get_base_fee(env),
        metadata_fee: get_metadata_fee(env),
        paused: is_paused(env),
    }
}

// Pause management
pub fn is_paused(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false)
}

pub fn set_paused(env: &Env, paused: bool) {
    env.storage().instance().set(&DataKey::Paused, &paused);
}

// Token lookup by address
pub fn get_token_info_by_address(env: &Env, token_address: &Address) -> Option<TokenInfo> {
    env.storage()
        .instance()
        .get(&DataKey::TokenByAddress(token_address.clone()))
}

pub fn set_token_info_by_address(env: &Env, token_address: &Address, info: &TokenInfo) {
    env.storage()
        .instance()
        .set(&DataKey::TokenByAddress(token_address.clone()), info);
}

// Update token supply after burn
pub fn update_token_supply(env: &Env, token_address: &Address, amount_change: i128) -> Option<()> {
    let mut info = get_token_info_by_address(env, token_address)?;

    // Update total supply
    info.total_supply = info.total_supply.checked_add(amount_change)?;

    // If burning (negative change), update total_burned
    if amount_change < 0 {
        info.total_burned = info.total_burned.checked_add(-amount_change)?;
        info.burn_count = info.burn_count.checked_add(1)?;
    }

    // Save updated info
    set_token_info_by_address(env, token_address, &info);

    Some(())
}
