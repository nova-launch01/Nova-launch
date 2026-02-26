# Token Burn Quick Reference

**Quick access guide for developers implementing burn functionality**

---

## Function Signatures

### Self Burn
```rust
pub fn burn(env: Env, token_address: Address, from: Address, amount: i128) -> Result<(), Error>
```
**Use:** User burns own tokens  
**Auth:** `from.require_auth()`

### Admin Burn
```rust
pub fn admin_burn(env: Env, token_address: Address, admin: Address, from: Address, amount: i128) -> Result<(), Error>
```
**Use:** Admin burns from any address  
**Auth:** `admin.require_auth()` + creator check

### Batch Burn
```rust
pub fn burn_batch(env: Env, token_address: Address, burns: Vec<(Address, i128)>) -> Result<(), Error>
```
**Use:** Multiple burns in one tx  
**Auth:** Each address authorizes

---

## Error Codes

| Code | Error | Condition |
|------|-------|-----------|
| 7 | `BurnAmountExceedsBalance` | `amount > balance` |
| 8 | `BurnNotEnabled` | Feature disabled |
| 9 | `InvalidBurnAmount` | `amount <= 0` |

---

## Event Schema

```rust
pub struct TokenBurned {
    pub token_address: Address,
    pub from: Address,
    pub amount: i128,
    pub burned_by: Address,
    pub timestamp: u64,
    pub is_admin_burn: bool,
}
```

---

## Gas Costs

| Operation | Cost | Savings |
|-----------|------|---------|
| Single burn | 100k | - |
| Batch (2) | 170k | 15% |
| Batch (5) | 380k | 24% |
| Batch (10) | 720k | 28% |

---

## Security Checklist

- [ ] Validate amount > 0
- [ ] Check balance >= amount
- [ ] Verify authorization
- [ ] Use checked arithmetic
- [ ] Emit events
- [ ] Test edge cases

---

## Example Usage

```rust
// Self burn
factory.burn(&token_addr, &user_addr, &1000_0000000)?;

// Admin burn
factory.admin_burn(&token_addr, &admin_addr, &user_addr, &500_0000000)?;

// Batch burn
let burns = vec![&env, (user1, 100), (user2, 200)];
factory.burn_batch(&token_addr, &burns)?;
```

---

**Full Spec:** `/docs/token-burn-spec.md`
