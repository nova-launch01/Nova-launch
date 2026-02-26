use soroban_sdk::{Address, Env, Symbol};
use crate::storage;
use crate::types::Error;

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

/// Maximum tokens that can be burned in a single batch operation.
/// Prevents DoS via gas exhaustion.
const MAX_BATCH_BURN: u32 = 100;

// ─────────────────────────────────────────────
//  Public burn entry-points (called from lib.rs)
// ─────────────────────────────────────────────

/// Burn tokens from the caller's own balance.
///
/// # Security properties
/// - Caller must authenticate via `require_auth()`
/// - Amount must be > 0 and ≤ caller's current balance
/// - Supply and balance are updated atomically in the same storage write
/// - Emits a `burn` event for off-chain auditability
pub fn burn(env: &Env, caller: Address, token_index: u32, amount: i128) -> Result<(), Error> {
    // 1. Authentication — caller must sign
    caller.require_auth();

    // 2. Input validation
    validate_amount(amount)?;

    // 3. Load token — fail fast if not found
    let mut info = storage::get_token_info(env, token_index).ok_or(Error::TokenNotFound)?;

    // 4. Load caller balance
    let balance = storage::get_balance(env, token_index, &caller);

    // 5. Sufficient-funds check (no underflow possible after this)
    if balance < amount {
        return Err(Error::InsufficientBalance);
    }

    // 6. Arithmetic — safe because:
    //    • amount   > 0           (validated above)
    //    • balance  >= amount     (checked above)
    //    • total_supply >= amount (invariant: sum of all balances == total_supply)
    let new_balance = balance
        .checked_sub(amount)
        .ok_or(Error::ArithmeticError)?;

    let new_supply = info
        .total_supply
        .checked_sub(amount)
        .ok_or(Error::ArithmeticError)?;

    // 7. Atomic state update — both writes happen before any external call
    storage::set_balance(env, token_index, &caller, new_balance);
    info.total_supply = new_supply;
    storage::set_token_info(env, token_index, &info);

    // 8. Increment burn counter for the token
    storage::increment_burn_count(env, token_index);

    // 9. Emit event — after state is fully committed
    emit_burn_event(env, token_index, &caller, amount, new_supply);

    Ok(())
}

/// Admin-initiated burn from any holder's balance.
///
/// # Security properties
/// - Admin must authenticate AND match the stored admin address
/// - Holder must be a valid address holding sufficient balance
/// - Same atomic update guarantee as `burn()`
pub fn admin_burn(
    env: &Env,
    admin: Address,
    token_index: u32,
    holder: Address,
    amount: i128,
) -> Result<(), Error> {
    // 1. Admin authentication
    admin.require_auth();

    // 2. Verify caller is the actual admin (prevent privilege escalation)
    let current_admin = storage::get_admin(env);
    if admin != current_admin {
        return Err(Error::Unauthorized);
    }

    // 3. Input validation
    validate_amount(amount)?;
    validate_address(&holder)?;

    // 4. Load token
    let mut info = storage::get_token_info(env, token_index).ok_or(Error::TokenNotFound)?;

    // 5. Load holder balance
    let balance = storage::get_balance(env, token_index, &holder);

    if balance < amount {
        return Err(Error::InsufficientBalance);
    }

    // 6. Safe arithmetic
    let new_balance = balance
        .checked_sub(amount)
        .ok_or(Error::ArithmeticError)?;

    let new_supply = info
        .total_supply
        .checked_sub(amount)
        .ok_or(Error::ArithmeticError)?;

    // 7. Atomic state update
    storage::set_balance(env, token_index, &holder, new_balance);
    info.total_supply = new_supply;
    storage::set_token_info(env, token_index, &info);

    storage::increment_burn_count(env, token_index);

    // 8. Emit event with both admin and holder for auditability
    emit_admin_burn_event(env, token_index, &admin, &holder, amount, new_supply);

    Ok(())
}

/// Burn tokens from multiple holders in a single transaction.
///
/// # Security properties
/// - Admin-only; same double-auth check as `admin_burn()`
/// - Hard cap of `MAX_BATCH_BURN` entries prevents DoS
/// - Each individual burn is validated before any state is mutated
/// - If any entry is invalid the entire batch is rejected (all-or-nothing)
pub fn batch_burn(
    env: &Env,
    admin: Address,
    token_index: u32,
    burns: soroban_sdk::Vec<(Address, i128)>,
) -> Result<(), Error> {
    // 1. Admin authentication
    admin.require_auth();

    let current_admin = storage::get_admin(env);
    if admin != current_admin {
        return Err(Error::Unauthorized);
    }

    // 2. DoS guard
    if burns.len() > MAX_BATCH_BURN {
        return Err(Error::BatchTooLarge);
    }

    if burns.is_empty() {
        return Err(Error::InvalidParameters);
    }

    // 3. Load token once
    let mut info = storage::get_token_info(env, token_index).ok_or(Error::TokenNotFound)?;

    // 4. Pre-validation pass — validate ALL entries before mutating ANY state
    //    This is the key to the all-or-nothing guarantee.
    let mut total_burn: i128 = 0;
    for i in 0..burns.len() {
        let (ref holder, amount) = burns.get(i).unwrap();
        validate_amount(amount)?;
        validate_address(holder)?;

        let balance = storage::get_balance(env, token_index, holder);
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }

        // Accumulate to check total against supply (prevents overflow attack)
        total_burn = total_burn
            .checked_add(amount)
            .ok_or(Error::ArithmeticError)?;
    }

    // Supply check on the aggregate total
    if info.total_supply < total_burn {
        return Err(Error::InsufficientBalance);
    }

    // 5. Mutation pass — all validations passed, now update state
    for i in 0..burns.len() {
        let (ref holder, amount) = burns.get(i).unwrap();
        let balance = storage::get_balance(env, token_index, holder);
        let new_balance = balance.checked_sub(amount).ok_or(Error::ArithmeticError)?;
        storage::set_balance(env, token_index, holder, new_balance);
    }

    let new_supply = info
        .total_supply
        .checked_sub(total_burn)
        .ok_or(Error::ArithmeticError)?;

    info.total_supply = new_supply;
    storage::set_token_info(env, token_index, &info);
    storage::increment_burn_count(env, token_index);

    emit_batch_burn_event(env, token_index, &admin, burns.len(), total_burn, new_supply);

    Ok(())
}

// ─────────────────────────────────────────────
//  Query helpers
// ─────────────────────────────────────────────

/// Return the total number of burn operations performed on a token.
pub fn get_burn_count(env: &Env, token_index: u32) -> u32 {
    storage::get_burn_count(env, token_index)
}

/// Return a holder's current balance for a token.
pub fn get_balance(env: &Env, token_index: u32, holder: &Address) -> i128 {
    storage::get_balance(env, token_index, holder)
}

// ─────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────

/// Validates that a burn amount is strictly positive.
fn validate_amount(amount: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidParameters);
    }
    Ok(())
}

/// Validates that an address is not the zero/default address.
/// In Soroban the SDK prevents constructing a truly null Address,
/// so this is a belt-and-suspenders check on the public API surface.
fn validate_address(addr: &Address) -> Result<(), Error> {
    // Soroban Address cannot be null, but we keep this stub so
    // additional chain-specific validation can be added here later.
    let _ = addr;
    Ok(())
}

// ─────────────────────────────────────────────
//  Event emission
// ─────────────────────────────────────────────

fn emit_burn_event(env: &Env, token_index: u32, caller: &Address, amount: i128, new_supply: i128) {
    env.events().publish(
        (Symbol::new(env, "burn"), token_index),
        (caller.clone(), amount, new_supply),
    );
}

fn emit_admin_burn_event(
    env: &Env,
    token_index: u32,
    admin: &Address,
    holder: &Address,
    amount: i128,
    new_supply: i128,
) {
    env.events().publish(
        (Symbol::new(env, "admin_burn"), token_index),
        (admin.clone(), holder.clone(), amount, new_supply),
    );
}

fn emit_batch_burn_event(
    env: &Env,
    token_index: u32,
    admin: &Address,
    count: u32,
    total_burned: i128,
    new_supply: i128,
) {
    env.events().publish(
        (Symbol::new(env, "batch_burn"), token_index),
        (admin.clone(), count, total_burned, new_supply),
    );
}
