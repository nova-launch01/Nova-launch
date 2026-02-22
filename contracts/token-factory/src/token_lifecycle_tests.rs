#[test]
fn test_full_token_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    // 1. Deploy the Nova Launchpad
    let launchpad_id = env.register_contract(None, NovaLaunchpad);
    let client = NovaLaunchpadClient::new(&env, &launchpad_id);

    // 2. Test Deployment with Metadata
    let token_name = String::from_str(&env, "Nova Coin");
    let token_symbol = String::from_str(&env, "NOVA");
    
    let token_address = client.deploy_token(
        &admin, 
        &token_name, 
        &token_symbol, 
        &18
    );

    // 3. Test Minting & Fee Collection
    let mint_amount = 1_000_000_i128;
    client.mint_token(&admin, &token_address, &mint_amount);

    // Verify balances (Accounting for possible protocol fees)
    let token_client = token::Client::new(&env, &token_address);
    assert_eq!(token_client.balance(&admin), expected_after_fees);
}

#[test]
fn test_multiple_tokens_isolation() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    
    let launchpad_id = env.register_contract(None, NovaLaunchpad);
    let client = NovaLaunchpadClient::new(&env, &launchpad_id);

    // Deploy Token 1
    let token_1_addr = client.deploy_token(&admin, &String::from_str(&env, "Token One"), &String::from_str(&env, "T1"), &18);
    
    // Deploy Token 2
    let token_2_addr = client.deploy_token(&admin, &String::from_str(&env, "Token Two"), &String::from_str(&env, "T2"), &18);

    // Mint to Token 1 only
    client.mint_token(&admin, &token_1_addr, &1000);

    // Assertions
    let client_1 = token::Client::new(&env, &token_1_addr);
    let client_2 = token::Client::new(&env, &token_2_addr);

    assert_ne!(token_1_addr, token_2_addr);
    assert_eq!(client_1.balance(&admin), 1000);
    assert_eq!(client_2.balance(&admin), 0); // Proof of isolation
}

#[test]
fn test_fee_collection() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);

    let launchpad_id = env.register_contract(None, NovaLaunchpad);
    let client = NovaLaunchpadClient::new(&env, &launchpad_id);

    // Set fee (e.g., 5%)
    client.set_fee_params(&admin, &treasury, &500); // 500 BPS = 5%

    let token_addr = client.deploy_token(&admin, &String::from_str(&env, "FeeToken"), &String::from_str(&env, "FEE"), &18);
    
    // Mint 100 tokens
    client.mint_token(&admin, &token_addr, &100);

    let token_client = token::Client::new(&env, &token_addr);
    
    // Assert 95 goes to admin, 5 goes to treasury
    assert_eq!(token_client.balance(&admin), 95);
    assert_eq!(token_client.balance(&treasury), 5);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")] // Replace #1 with your specific Error code
fn test_unauthorized_minting() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let hacker = Address::generate(&env);

    let launchpad_id = env.register_contract(None, NovaLaunchpad);
    let client = NovaLaunchpadClient::new(&env, &launchpad_id);

    let token_addr = client.deploy_token(&admin, &String::from_str(&env, "Secure"), &String::from_str(&env, "SEC"), &18);

    // Hacker tries to mint tokens for themselves
    client.mint_token(&hacker, &token_addr, &1000000); 
}