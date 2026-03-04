use soroban_sdk::{Address, Env, Vec};
use crate::types::{Error, PaginatedTokens, TokenInfo};
use crate::storage;

/// Maximum number of tokens per page
const MAX_PAGE_SIZE: u32 = 100;

/// Default page size if not specified
const DEFAULT_PAGE_SIZE: u32 = 20;

/// Get tokens created by a specific address with pagination
///
/// Returns a paginated list of tokens created by the specified address.
/// Results are ordered by token creation order (token index).
///
/// # Arguments
/// * `env` - The contract environment
/// * `creator` - Address of the token creator
/// * `cursor` - Optional cursor for pagination (None = start from beginning)
/// * `limit` - Maximum number of tokens to return (capped at MAX_PAGE_SIZE)
///
/// # Returns
/// Returns `PaginatedTokens` containing:
/// - `tokens`: Vector of TokenInfo for this page
/// - `cursor`: Optional cursor for next page (None = no more results)
///
/// # Cursor Semantics
/// - Cursor contains `next_index` which is the position in the creator's token list
/// - Cursors are deterministic and stable across calls
/// - Empty cursor (None) starts from the beginning
/// - Returned cursor of None indicates end of results
///
/// # Examples
/// ```
/// // First page
/// let page1 = factory.get_tokens_by_creator(&env, creator, None, 20)?;
/// 
/// // Next page
/// if let Some(cursor) = page1.cursor {
///     let page2 = factory.get_tokens_by_creator(&env, creator, Some(cursor), 20)?;
/// }
/// ```
pub fn get_tokens_by_creator(
    env: &Env,
    creator: &Address,
    cursor: Option<u32>,
    limit: Option<u32>,
) -> Result<PaginatedTokens, Error> {
    // Validate and cap limit
    let page_size = limit
        .unwrap_or(DEFAULT_PAGE_SIZE)
        .min(MAX_PAGE_SIZE)
        .max(1); // At least 1
    
    // Get all token indices for this creator
    let creator_tokens = storage::get_creator_tokens(env, creator);
    
    // Determine starting position
    let start_pos = cursor.unwrap_or(0);
    
    // Check if we're past the end
    if start_pos >= creator_tokens.len() {
        return Ok(PaginatedTokens {
            tokens: Vec::new(env),
            cursor: None,
        });
    }
    
    // Collect tokens for this page
    let mut tokens = Vec::new(env);
    let mut count = 0_u32;
    let mut current_pos = start_pos;
    
    while count < page_size && current_pos < creator_tokens.len() {
        let token_index = creator_tokens.get(current_pos).unwrap();
        
        if let Some(token_info) = storage::get_token_info(env, token_index) {
            tokens.push_back(token_info);
            count += 1;
        }
        
        current_pos += 1;
    }
    
    // Determine next cursor
    let next_cursor = if current_pos < creator_tokens.len() {
        Some(current_pos)
    } else {
        None
    };
    
    Ok(PaginatedTokens {
        tokens,
        cursor: next_cursor,
    })
}

/// Get the total number of tokens created by an address
///
/// Returns the count without fetching the actual token data.
///
/// # Arguments
/// * `env` - The contract environment
/// * `creator` - Address of the token creator
///
/// # Returns
/// Returns the number of tokens created by this address
pub fn get_creator_token_count(env: &Env, creator: &Address) -> u32 {
    storage::get_creator_token_count(env, creator)
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};
    
    fn setup_with_tokens(token_count: u32) -> (Env, Address) {
        let env = Env::default();
        let creator = Address::generate(&env);
        
        // Create mock tokens
        for i in 0..token_count {
            let token_info = TokenInfo {
                address: Address::generate(&env),
                creator: creator.clone(),
                name: soroban_sdk::String::from_str(&env, "Test Token"),
                symbol: soroban_sdk::String::from_str(&env, "TST"),
                decimals: 7,
                total_supply: 1_000_000,
                initial_supply: 1_000_000,
                max_supply: None,
                total_burned: 0,
                burn_count: 0,
                metadata_uri: None,
                created_at: env.ledger().timestamp(),
                clawback_enabled: false,
            };
            
            storage::set_token_info(&env, i, &token_info);
            storage::add_creator_token(&env, &creator, i);
        }
        
        (env, creator)
    }
    
    #[test]
    fn test_get_tokens_first_page() {
        let (env, creator) = setup_with_tokens(50);
        
        let result = get_tokens_by_creator(&env, &creator, None, Some(20)).unwrap();
        
        assert_eq!(result.tokens.len(), 20);
        assert!(result.cursor.is_some());
    }
    
    #[test]
    fn test_get_tokens_pagination() {
        let (env, creator) = setup_with_tokens(50);
        
        // First page
        let page1 = get_tokens_by_creator(&env, &creator, None, Some(20)).unwrap();
        assert_eq!(page1.tokens.len(), 20);
        assert!(page1.cursor.is_some());
        
        // Second page
        let page2 = get_tokens_by_creator(&env, &creator, page1.cursor, Some(20)).unwrap();
        assert_eq!(page2.tokens.len(), 20);
        assert!(page2.cursor.is_some());
        
        // Third page (last 10)
        let page3 = get_tokens_by_creator(&env, &creator, page2.cursor, Some(20)).unwrap();
        assert_eq!(page3.tokens.len(), 10);
        assert!(page3.cursor.is_none()); // No more results
    }
    
    #[test]
    fn test_get_tokens_empty_results() {
        let env = Env::default();
        let creator = Address::generate(&env);
        
        let result = get_tokens_by_creator(&env, &creator, None, Some(20)).unwrap();
        
        assert_eq!(result.tokens.len(), 0);
        assert!(result.cursor.is_none());
    }
    
    #[test]
    fn test_get_tokens_single_token() {
        let (env, creator) = setup_with_tokens(1);
        
        let result = get_tokens_by_creator(&env, &creator, None, Some(20)).unwrap();
        
        assert_eq!(result.tokens.len(), 1);
        assert!(result.cursor.is_none());
    }
    
    #[test]
    fn test_get_tokens_exact_page_size() {
        let (env, creator) = setup_with_tokens(20);
        
        let result = get_tokens_by_creator(&env, &creator, None, Some(20)).unwrap();
        
        assert_eq!(result.tokens.len(), 20);
        assert!(result.cursor.is_none()); // Exactly one page
    }
    
    #[test]
    fn test_get_tokens_max_limit_enforced() {
        let (env, creator) = setup_with_tokens(200);
        
        // Request more than MAX_PAGE_SIZE
        let result = get_tokens_by_creator(&env, &creator, None, Some(150)).unwrap();
        
        // Should be capped at MAX_PAGE_SIZE (100)
        assert_eq!(result.tokens.len(), 100);
        assert!(result.cursor.is_some());
    }
    
    #[test]
    fn test_get_tokens_default_limit() {
        let (env, creator) = setup_with_tokens(50);
        
        // No limit specified, should use DEFAULT_PAGE_SIZE (20)
        let result = get_tokens_by_creator(&env, &creator, None, None).unwrap();
        
        assert_eq!(result.tokens.len(), 20);
        assert!(result.cursor.is_some());
    }
    
    #[test]
    fn test_get_tokens_cursor_past_end() {
        let (env, creator) = setup_with_tokens(10);
        
        // Create cursor past the end
        let invalid_cursor = 100u32;
        
        let result = get_tokens_by_creator(&env, &creator, Some(invalid_cursor), Some(20)).unwrap();
        
        assert_eq!(result.tokens.len(), 0);
        assert!(result.cursor.is_none());
    }
    
    #[test]
    fn test_get_tokens_deterministic_ordering() {
        let (env, creator) = setup_with_tokens(30);
        
        // Fetch first page twice
        let result1 = get_tokens_by_creator(&env, &creator, None, Some(10)).unwrap();
        let result2 = get_tokens_by_creator(&env, &creator, None, Some(10)).unwrap();
        
        // Results should be identical
        assert_eq!(result1.tokens.len(), result2.tokens.len());
        for i in 0..result1.tokens.len() {
            let token1 = result1.tokens.get(i).unwrap();
            let token2 = result2.tokens.get(i).unwrap();
            assert_eq!(token1.address, token2.address);
        }
    }
    
    #[test]
    fn test_get_creator_token_count() {
        let (env, creator) = setup_with_tokens(42);
        
        let count = get_creator_token_count(&env, &creator);
        
        assert_eq!(count, 42);
    }
    
    #[test]
    fn test_get_creator_token_count_zero() {
        let env = Env::default();
        let creator = Address::generate(&env);
        
        let count = get_creator_token_count(&env, &creator);
        
        assert_eq!(count, 0);
    }
    
    #[test]
    fn test_pagination_boundary_conditions() {
        let (env, creator) = setup_with_tokens(21);
        
        // First page of 20
        let page1 = get_tokens_by_creator(&env, &creator, None, Some(20)).unwrap();
        assert_eq!(page1.tokens.len(), 20);
        assert!(page1.cursor.is_some());
        
        // Second page should have exactly 1 token
        let page2 = get_tokens_by_creator(&env, &creator, page1.cursor, Some(20)).unwrap();
        assert_eq!(page2.tokens.len(), 1);
        assert!(page2.cursor.is_none());
    }
    
    #[test]
    fn test_multiple_creators_isolated() {
        let env = Env::default();
        let creator1 = Address::generate(&env);
        let creator2 = Address::generate(&env);
        
        // Create tokens for creator1
        for i in 0..10 {
            let token_info = TokenInfo {
                address: Address::generate(&env),
                creator: creator1.clone(),
                name: soroban_sdk::String::from_str(&env, "Token1"),
                symbol: soroban_sdk::String::from_str(&env, "TK1"),
                decimals: 7,
                total_supply: 1_000_000,
                initial_supply: 1_000_000,
                max_supply: None,
                total_burned: 0,
                burn_count: 0,
                metadata_uri: None,
                created_at: env.ledger().timestamp(),
                clawback_enabled: false,
            };
            storage::set_token_info(&env, i, &token_info);
            storage::add_creator_token(&env, &creator1, i);
        }
        
        // Create tokens for creator2
        for i in 10..15 {
            let token_info = TokenInfo {
                address: Address::generate(&env),
                creator: creator2.clone(),
                name: soroban_sdk::String::from_str(&env, "Token2"),
                symbol: soroban_sdk::String::from_str(&env, "TK2"),
                decimals: 7,
                total_supply: 2_000_000,
                initial_supply: 2_000_000,
                max_supply: None,
                total_burned: 0,
                burn_count: 0,
                metadata_uri: None,
                created_at: env.ledger().timestamp(),
                clawback_enabled: false,
            };
            storage::set_token_info(&env, i, &token_info);
            storage::add_creator_token(&env, &creator2, i);
        }
        
        // Verify creator1 has 10 tokens
        let result1 = get_tokens_by_creator(&env, &creator1, None, Some(20)).unwrap();
        assert_eq!(result1.tokens.len(), 10);
        
        // Verify creator2 has 5 tokens
        let result2 = get_tokens_by_creator(&env, &creator2, None, Some(20)).unwrap();
        assert_eq!(result2.tokens.len(), 5);
    }
}
