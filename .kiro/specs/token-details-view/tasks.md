# Implementation Plan: Token Details View

## Overview

This implementation plan breaks down the Token Details View feature into incremental coding tasks. Each task builds on previous work, starting with core data structures and hooks, then building presentational components, and finally wiring everything together with routing and integration. Testing tasks are included as optional sub-tasks to validate correctness properties and edge cases.

## Tasks

- [ ] 1. Set up types, utilities, and services
  - [ ] 1.1 Add ViewState type and extend TokenService
    - Add `ViewState` type to `types/index.ts`
    - Add `getTokenInfo` method to TokenService (or create if doesn't exist)
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 1.2 Create MetadataService for fetching token metadata
    - Create `services/MetadataService.ts`
    - Implement `fetchMetadata` method to fetch from IPFS/HTTP
    - Handle metadata validation and error cases
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 1.3 Create formatting utilities
    - Add `formatTokenSupply` function to `utils/formatting.ts`
    - Add `formatAddress` function to `utils/formatting.ts`
    - Add `getStellarExplorerUrl` function to `utils/formatting.ts`
    - _Requirements: 3.5, 7.2, 7.3_
  
  - [ ]* 1.4 Write unit tests for formatting utilities
    - Test `formatTokenSupply` with various supply values
    - Test `formatAddress` with different address lengths
    - Test `getStellarExplorerUrl` for testnet and mainnet
    - _Requirements: 3.5, 7.2, 7.3_

- [ ] 2. Create custom hooks
  - [ ] 2.1 Implement useTokenDetails hook
    - Create `hooks/useTokenDetails.ts`
    - Fetch token info and metadata on mount
    - Handle loading, error, and success states
    - Provide refetch functionality
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.4_
  
  - [ ] 2.2 Implement useClipboard hook
    - Create `hooks/useClipboard.ts`
    - Use Clipboard API to copy text
    - Show toast notifications on success/failure
    - Handle clipboard API unavailability
    - _Requirements: 4.2, 4.3, 4.4, 5.2, 5.3_
  
  - [ ]* 2.3 Write property test for useTokenDetails hook
    - **Property 13: Retry triggers data reload**
    - **Validates: Requirements 9.4**
  
  - [ ]* 2.4 Write unit tests for useClipboard hook
    - Test successful copy operation
    - Test clipboard API failure
    - Test toast notification display
    - _Requirements: 4.2, 4.3, 4.4, 5.2, 5.3_

- [ ] 3. Create presentational components
  - [ ] 3.1 Create TokenHeader component
    - Create `components/TokenDetailsView/TokenHeader.tsx`
    - Display token name, symbol, and address
    - Include copy button for address
    - Use existing Button and Tooltip components
    - _Requirements: 1.1, 1.2, 1.3, 4.1_
  
  - [ ] 3.2 Create MetadataSection component
    - Create `components/TokenDetailsView/MetadataSection.tsx`
    - Display token image with fallback
    - Display token description or placeholder message
    - Use Skeleton component for loading state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 3.3 Create DetailsSection component
    - Create `components/TokenDetailsView/DetailsSection.tsx`
    - Display decimals, supply, creator, and transaction hash
    - Include copy button for transaction hash
    - Format numeric values using utility functions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1_
  
  - [ ] 3.4 Create ActionsSection component
    - Create `components/TokenDetailsView/ActionsSection.tsx`
    - Add mint button with navigation handler
    - Add explorer button with external link handler
    - Ensure buttons are accessible and clearly labeled
    - _Requirements: 6.1, 6.4, 7.1, 7.4_
  
  - [ ]* 3.5 Write property tests for presentational components
    - **Property 1: Header displays complete token identity**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - **Property 5: Details section displays all technical information**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - **Property 6: Numeric values are formatted with separators**
    - **Validates: Requirements 3.5**

- [ ] 4. Checkpoint - Ensure component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create container component
  - [ ] 5.1 Implement TokenDetailsView container component
    - Create `components/TokenDetailsView/index.tsx`
    - Use useTokenDetails hook to fetch data
    - Use useClipboard hook for copy operations
    - Manage loading, error, and success states
    - Compose all presentational components
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2_
  
  - [ ] 5.2 Implement error and loading states
    - Add loading indicator using Spinner component
    - Add error display with retry button
    - Handle "token not found" case
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 5.3 Implement responsive layout
    - Apply Tailwind responsive classes for mobile/tablet/desktop
    - Ensure proper spacing and layout at all breakpoints
    - Stack sections vertically on mobile, use grid on desktop
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 5.4 Write property tests for TokenDetailsView
    - **Property 2: Metadata section displays content when metadata exists**
    - **Validates: Requirements 2.1, 2.2**
    - **Property 3: Metadata section displays placeholders when metadata is missing**
    - **Validates: Requirements 2.3, 2.4**
    - **Property 4: Metadata section appears before details section**
    - **Validates: Requirements 2.5**
    - **Property 12: Error state displays error message**
    - **Validates: Requirements 9.2**
  
  - [ ]* 5.5 Write unit tests for TokenDetailsView
    - Test loading state rendering
    - Test error state with retry button
    - Test token not found case
    - Test successful data display
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 6. Implement user interactions
  - [ ] 6.1 Implement copy address functionality
    - Wire copy button to useClipboard hook
    - Pass token address to copy function
    - Verify toast notification appears
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ] 6.2 Implement copy transaction hash functionality
    - Wire copy button to useClipboard hook
    - Pass transaction hash to copy function
    - Verify toast notification appears
    - _Requirements: 5.2, 5.3_
  
  - [ ] 6.3 Implement mint button navigation
    - Add navigation handler to mint button
    - Navigate to mint form route with token address as parameter
    - Use React Router's navigate or similar
    - _Requirements: 6.2, 6.3_
  
  - [ ] 6.4 Implement explorer button functionality
    - Add click handler to explorer button
    - Use getStellarExplorerUrl utility to build URL
    - Open URL in new tab using window.open
    - _Requirements: 7.2, 7.3_
  
  - [ ]* 6.5 Write property tests for user interactions
    - **Property 7: Copy button copies token address to clipboard**
    - **Validates: Requirements 4.2**
    - **Property 8: Copy button copies transaction hash to clipboard**
    - **Validates: Requirements 5.2**
    - **Property 9: Copy operations display confirmation feedback**
    - **Validates: Requirements 4.3, 5.3**
    - **Property 10: Mint button navigates with pre-populated address**
    - **Validates: Requirements 6.2, 6.3**
    - **Property 11: Explorer button opens correct URL in new tab**
    - **Validates: Requirements 7.2, 7.3**

- [ ] 7. Checkpoint - Ensure interaction tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Add routing and integrate with App
  - [ ] 8.1 Add route for token details view
    - Install React Router if not already present
    - Add route in App.tsx: `/token/:tokenAddress`
    - Configure TokenDetailsView to read tokenAddress from URL params
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 8.2 Add navigation from TokenDeployForm to TokenDetailsView
    - After successful deployment, navigate to token details
    - Pass deployed token address as URL parameter
    - _Requirements: 6.2, 6.3_
  
  - [ ] 8.3 Update mint form to accept pre-populated token address
    - Modify mint form route to accept token address parameter
    - Pre-populate token address field when parameter exists
    - _Requirements: 6.2, 6.3_
  
  - [ ]* 8.4 Write integration tests for routing
    - Test navigation from deploy form to details view
    - Test navigation from details view to mint form
    - Test deep linking to specific token details
    - _Requirements: 6.2, 6.3_

- [ ] 9. Create test generators
  - [ ] 9.1 Add generators for property tests
    - Add `tokenInfoGenerator` to `test/generators.ts`
    - Add `tokenMetadataGenerator` to `test/generators.ts`
    - Add `tokenAddressGenerator` to `test/generators.ts`
    - Add `transactionHashGenerator` to `test/generators.ts`
    - Follow existing generator patterns in the file
    - _Requirements: All_
  
  - [ ]* 9.2 Write unit tests for generators
    - Test that generators produce valid data
    - Test generator edge cases
    - _Requirements: All_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- The implementation follows the existing project structure and patterns
- All components use TypeScript with proper type definitions
- Tailwind CSS is used for styling following existing patterns
- Existing UI components (Button, Card, Skeleton, Toast, Spinner) are reused where possible
