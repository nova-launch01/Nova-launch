//! Proposal State Machine
//!
//! Enforces legal state transitions for proposal lifecycle.
//! Implements a strict state machine to prevent invalid state changes.

use crate::types::{Error, ProposalState};

/// State machine for proposal lifecycle
///
/// Defines all legal state transitions and validates them.
///
/// # State Transition Rules
/// ```text
/// Created -> Active
/// Active -> Succeeded | Defeated | Expired
/// Succeeded -> Queued
/// Queued -> Executed | Expired
/// 
/// Terminal States (no transitions allowed):
/// - Defeated
/// - Executed
/// - Expired
/// - Cancelled
/// ```
pub struct ProposalStateMachine;

impl ProposalStateMachine {
    /// Check if a state is terminal (no further transitions allowed)
    pub fn is_terminal_state(state: ProposalState) -> bool {
        matches!(
            state,
            ProposalState::Defeated
                | ProposalState::Executed
                | ProposalState::Expired
                | ProposalState::Cancelled
        )
    }

    /// Validate if a state transition is legal
    ///
    /// # Arguments
    /// * `from` - Current state
    /// * `to` - Desired next state
    ///
    /// # Returns
    /// * `Ok(())` - Transition is valid
    /// * `Err(Error)` - Transition is invalid with specific error
    pub fn validate_transition(from: ProposalState, to: ProposalState) -> Result<(), Error> {
        // Cannot transition from terminal states
        if Self::is_terminal_state(from) {
            return Err(Error::ProposalInTerminalState);
        }

        // Cannot transition to the same state
        if from == to {
            return Ok(()); // No-op transition is allowed
        }

        // Validate specific transitions
        match (from, to) {
            // Created -> Active
            (ProposalState::Created, ProposalState::Active) => Ok(()),

            // Active -> Succeeded, Defeated, or Expired
            (ProposalState::Active, ProposalState::Succeeded) => Ok(()),
            (ProposalState::Active, ProposalState::Defeated) => Ok(()),
            (ProposalState::Active, ProposalState::Expired) => Ok(()),

            // Succeeded -> Queued
            (ProposalState::Succeeded, ProposalState::Queued) => Ok(()),

            // Queued -> Executed or Expired
            (ProposalState::Queued, ProposalState::Executed) => Ok(()),
            (ProposalState::Queued, ProposalState::Expired) => Ok(()),

            // Any state -> Cancelled (admin override)
            (_, ProposalState::Cancelled) => {
                if Self::is_terminal_state(from) {
                    Err(Error::ProposalInTerminalState)
                } else {
                    Ok(())
                }
            }

            // All other transitions are invalid
            _ => Err(Error::InvalidStateTransition),
        }
    }

    /// Get the next valid states from the current state
    pub fn get_valid_next_states(state: ProposalState) -> Vec<ProposalState> {
        match state {
            ProposalState::Created => vec![ProposalState::Active, ProposalState::Cancelled],
            ProposalState::Active => vec![
                ProposalState::Succeeded,
                ProposalState::Defeated,
                ProposalState::Expired,
                ProposalState::Cancelled,
            ],
            ProposalState::Succeeded => vec![ProposalState::Queued, ProposalState::Cancelled],
            ProposalState::Queued => {
                vec![ProposalState::Executed, ProposalState::Expired]
            }
            // Terminal states have no valid transitions
            ProposalState::Defeated
            | ProposalState::Executed
            | ProposalState::Expired
            | ProposalState::Cancelled => vec![],
        }
    }

    /// Check if a proposal can be voted on in its current state
    pub fn can_vote(state: ProposalState) -> bool {
        matches!(state, ProposalState::Active)
    }

    /// Check if a proposal can be queued in its current state
    pub fn can_queue(state: ProposalState) -> bool {
        matches!(state, ProposalState::Succeeded)
    }

    /// Check if a proposal can be executed in its current state
    pub fn can_execute(state: ProposalState) -> bool {
        matches!(state, ProposalState::Queued)
    }

    /// Check if a proposal can be cancelled in its current state
    pub fn can_cancel(state: ProposalState) -> bool {
        !Self::is_terminal_state(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_terminal_states() {
        assert!(ProposalStateMachine::is_terminal_state(
            ProposalState::Defeated
        ));
        assert!(ProposalStateMachine::is_terminal_state(
            ProposalState::Executed
        ));
        assert!(ProposalStateMachine::is_terminal_state(
            ProposalState::Expired
        ));
        assert!(ProposalStateMachine::is_terminal_state(
            ProposalState::Cancelled
        ));

        assert!(!ProposalStateMachine::is_terminal_state(
            ProposalState::Created
        ));
        assert!(!ProposalStateMachine::is_terminal_state(
            ProposalState::Active
        ));
        assert!(!ProposalStateMachine::is_terminal_state(
            ProposalState::Succeeded
        ));
        assert!(!ProposalStateMachine::is_terminal_state(
            ProposalState::Queued
        ));
    }

    #[test]
    fn test_valid_transitions() {
        // Created -> Active
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Created,
            ProposalState::Active
        )
        .is_ok());

        // Active -> Succeeded
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Active,
            ProposalState::Succeeded
        )
        .is_ok());

        // Active -> Defeated
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Active,
            ProposalState::Defeated
        )
        .is_ok());

        // Active -> Expired
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Active,
            ProposalState::Expired
        )
        .is_ok());

        // Succeeded -> Queued
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Succeeded,
            ProposalState::Queued
        )
        .is_ok());

        // Queued -> Executed
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Queued,
            ProposalState::Executed
        )
        .is_ok());

        // Queued -> Expired
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Queued,
            ProposalState::Expired
        )
        .is_ok());
    }

    #[test]
    fn test_invalid_transitions() {
        // Cannot skip states
        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Created,
                ProposalState::Succeeded
            ),
            Err(Error::InvalidStateTransition)
        );

        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Created,
                ProposalState::Executed
            ),
            Err(Error::InvalidStateTransition)
        );

        // Cannot go backwards
        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Active,
                ProposalState::Created
            ),
            Err(Error::InvalidStateTransition)
        );

        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Queued,
                ProposalState::Succeeded
            ),
            Err(Error::InvalidStateTransition)
        );

        // Cannot transition from Defeated
        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Defeated,
                ProposalState::Active
            ),
            Err(Error::ProposalInTerminalState)
        );
    }

    #[test]
    fn test_terminal_state_transitions() {
        // Cannot transition from Executed
        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Executed,
                ProposalState::Active
            ),
            Err(Error::ProposalInTerminalState)
        );

        // Cannot transition from Expired
        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Expired,
                ProposalState::Queued
            ),
            Err(Error::ProposalInTerminalState)
        );

        // Cannot transition from Cancelled
        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Cancelled,
                ProposalState::Active
            ),
            Err(Error::ProposalInTerminalState)
        );

        // Cannot cancel already terminal states
        assert_eq!(
            ProposalStateMachine::validate_transition(
                ProposalState::Executed,
                ProposalState::Cancelled
            ),
            Err(Error::ProposalInTerminalState)
        );
    }

    #[test]
    fn test_cancel_transitions() {
        // Can cancel from Created
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Created,
            ProposalState::Cancelled
        )
        .is_ok());

        // Can cancel from Active
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Active,
            ProposalState::Cancelled
        )
        .is_ok());

        // Can cancel from Succeeded
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Succeeded,
            ProposalState::Cancelled
        )
        .is_ok());

        // Cannot cancel from terminal states
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Defeated,
            ProposalState::Cancelled
        )
        .is_err());
    }

    #[test]
    fn test_same_state_transition() {
        // Same state transition is a no-op (allowed)
        assert!(ProposalStateMachine::validate_transition(
            ProposalState::Active,
            ProposalState::Active
        )
        .is_ok());
    }

    #[test]
    fn test_get_valid_next_states() {
        let created_next = ProposalStateMachine::get_valid_next_states(ProposalState::Created);
        assert_eq!(created_next.len(), 2);
        assert!(created_next.contains(&ProposalState::Active));
        assert!(created_next.contains(&ProposalState::Cancelled));

        let active_next = ProposalStateMachine::get_valid_next_states(ProposalState::Active);
        assert_eq!(active_next.len(), 4);
        assert!(active_next.contains(&ProposalState::Succeeded));
        assert!(active_next.contains(&ProposalState::Defeated));
        assert!(active_next.contains(&ProposalState::Expired));
        assert!(active_next.contains(&ProposalState::Cancelled));

        let executed_next = ProposalStateMachine::get_valid_next_states(ProposalState::Executed);
        assert_eq!(executed_next.len(), 0);
    }

    #[test]
    fn test_can_vote() {
        assert!(!ProposalStateMachine::can_vote(ProposalState::Created));
        assert!(ProposalStateMachine::can_vote(ProposalState::Active));
        assert!(!ProposalStateMachine::can_vote(ProposalState::Succeeded));
        assert!(!ProposalStateMachine::can_vote(ProposalState::Defeated));
        assert!(!ProposalStateMachine::can_vote(ProposalState::Queued));
        assert!(!ProposalStateMachine::can_vote(ProposalState::Executed));
        assert!(!ProposalStateMachine::can_vote(ProposalState::Expired));
        assert!(!ProposalStateMachine::can_vote(ProposalState::Cancelled));
    }

    #[test]
    fn test_can_queue() {
        assert!(!ProposalStateMachine::can_queue(ProposalState::Created));
        assert!(!ProposalStateMachine::can_queue(ProposalState::Active));
        assert!(ProposalStateMachine::can_queue(ProposalState::Succeeded));
        assert!(!ProposalStateMachine::can_queue(ProposalState::Defeated));
        assert!(!ProposalStateMachine::can_queue(ProposalState::Queued));
        assert!(!ProposalStateMachine::can_queue(ProposalState::Executed));
    }

    #[test]
    fn test_can_execute() {
        assert!(!ProposalStateMachine::can_execute(ProposalState::Created));
        assert!(!ProposalStateMachine::can_execute(ProposalState::Active));
        assert!(!ProposalStateMachine::can_execute(ProposalState::Succeeded));
        assert!(!ProposalStateMachine::can_execute(ProposalState::Defeated));
        assert!(ProposalStateMachine::can_execute(ProposalState::Queued));
        assert!(!ProposalStateMachine::can_execute(ProposalState::Executed));
    }

    #[test]
    fn test_can_cancel() {
        assert!(ProposalStateMachine::can_cancel(ProposalState::Created));
        assert!(ProposalStateMachine::can_cancel(ProposalState::Active));
        assert!(ProposalStateMachine::can_cancel(ProposalState::Succeeded));
        assert!(!ProposalStateMachine::can_cancel(ProposalState::Defeated));
        assert!(ProposalStateMachine::can_cancel(ProposalState::Queued));
        assert!(!ProposalStateMachine::can_cancel(ProposalState::Executed));
        assert!(!ProposalStateMachine::can_cancel(ProposalState::Expired));
        assert!(!ProposalStateMachine::can_cancel(ProposalState::Cancelled));
    }
}
