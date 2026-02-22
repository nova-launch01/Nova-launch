# Design Document: Token Details View

## Overview

The Token Details View is a React component that displays comprehensive information about a Stellar token. It follows a card-based layout pattern consistent with the existing application design, using the established UI component library (Button, Card, Skeleton, Toast) and Tailwind CSS for styling. The component fetches token data on mount, handles loading and error states gracefully, and provides interactive actions for copying addresses, navigating to mint functionality, and opening external blockchain explorers.

The design emphasizes responsive layout, accessibility, and user feedback through toast notifications for all user actions.

## Architecture

### Component Hierarchy

```
TokenDetailsView (Container Component)
├── TokenHeader (Presentational)
│   ├── TokenIdentity (name, symbol)
│   └── AddressDisplay (with copy button)
├── MetadataSection (Presentational)
│   ├── TokenImage (with fallback)
│   └── TokenDescription
├── DetailsSection (Presentational)
│   ├── DetailRow (decimals)
│   ├── DetailRow (supply)
│   ├── DetailRow (creator)
│   └── DetailRow (transaction hash with copy)
└── ActionsSection (Presentational)
    ├── MintButton
    ├── CopyAddressButton
    └── ExplorerButton
```

### Data Flow

1. **Component Mount**: TokenDetailsView receives `tokenAddress` as a prop or from URL params
2. **Data Fetching**: useTokenDetails hook fetches token data and metadata
3. **State Management**: Component manages loading, error, and success states
4. **User Actions**: Button clicks trigger clipboard operations, navigation, or external links
5. **Feedback**: Toast notifications confirm actions or display errors

### Routing Integration

The component integrates with React Router (or similar) to:
- Accept `tokenAddress` from URL parameters
- Navigate to mint form with pre-populated token address
- Support deep linking to specific token details

## Components and Interfaces

### TokenDetailsView Component

**Props:**
```typescript
interface TokenDetailsViewProps {
  tokenAddress?: string; // Optional if using URL params
}
```

**State:**
```typescript
interface TokenDetailsState {
  tokenInfo: TokenInfo | null;
  metadata: TokenMetadata | null;
  loading: boolean;
  error: AppError | null;
}
```

**Responsibilities:**
- Fetch token information and metadata
- Manage loading and error states
- Coordinate child components
- Handle user actions (copy, navigate, open explorer)

### TokenHeader Component

**Props:**
```typescript
interface TokenHeaderProps {
  name: string;
  symbol: string;
  address: string;
  onCopyAddress: () => void;
}
```

**Responsibilities:**
- Display token name and symbol prominently
- Show token address with copy button
- Provide visual hierarchy (name > symbol > address)

### MetadataSection Component

**Props:**
```typescript
interface MetadataSectionProps {
  metadata: TokenMetadata | null;
  loading: boolean;
}
```

**Responsibilities:**
- Display token image with fallback for missing images
- Show token description or placeholder message
- Handle loading state with skeleton UI

### DetailsSection Component

**Props:**
```typescript
interface DetailsSectionProps {
  decimals: number;
  totalSupply: string;
  creator: string;
  transactionHash: string;
  onCopyTransactionHash: () => void;
}
```

**Responsibilities:**
- Display technical token details in labeled rows
- Format numeric values for readability
- Provide copy functionality for transaction hash

### ActionsSection Component

**Props:**
```typescript
interface ActionsSectionProps {
  tokenAddress: string;
  onMint: () => void;
  onViewExplorer: () => void;
}
```

**Responsibilities:**
- Provide mint button that navigates to mint form
- Provide explorer button that opens Stellar explorer
- Ensure buttons are accessible and clearly labeled

## Data Models

### TokenInfo (Existing)

```typescript
interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creator: string;
  metadataUri?: string;
  deployedAt: number;
  transactionHash: string;
}
```

### TokenMetadata (Existing)

```typescript
interface TokenMetadata {
  name: string;
  description: string;
  image: string; // URL or IPFS hash
}
```

### ViewState (New)

```typescript
type ViewState = 'loading' | 'success' | 'error' | 'not-found';
```

## Hooks

### useTokenDetails

**Purpose:** Fetch and manage token information and metadata

**Interface:**
```typescript
interface UseTokenDetailsResult {
  tokenInfo: TokenInfo | null;
  metadata: TokenMetadata | null;
  loading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

function useTokenDetails(tokenAddress: string): UseTokenDetailsResult;
```

**Behavior:**
- Fetches token info from Stellar network on mount
- Fetches metadata from IPFS if metadataUri exists
- Handles errors and provides retry mechanism
- Returns loading state for UI feedback

### useClipboard

**Purpose:** Handle clipboard operations with user feedback

**Interface:**
```typescript
interface UseClipboardResult {
  copy: (text: string) => Promise<void>;
  copied: boolean;
}

function useClipboard(): UseClipboardResult;
```

**Behavior:**
- Copies text to clipboard using Clipboard API
- Shows toast notification on success/failure
- Provides copied state for UI feedback

## Services

### TokenService (Extension)

Add method to fetch token details:

```typescript
class TokenService {
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    // Fetch token data from Stellar network
    // Parse contract state
    // Return TokenInfo object
  }
}
```

### MetadataService (New)

```typescript
class MetadataService {
  async fetchMetadata(metadataUri: string): Promise<TokenMetadata> {
    // Parse URI (IPFS, HTTP, etc.)
    // Fetch metadata JSON
    // Validate structure
    // Return TokenMetadata object
  }
}
```

## Utilities

### formatTokenSupply

```typescript
function formatTokenSupply(supply: string, decimals: number): string {
  // Convert raw supply to decimal representation
  // Add thousand separators
  // Return formatted string
}
```

### formatAddress

```typescript
function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  // Truncate address for display
  // Format: "G2ABCD...XYZ9"
  // Return formatted string
}
```

### getStellarExplorerUrl

```typescript
function getStellarExplorerUrl(address: string, network: 'testnet' | 'mainnet'): string {
  // Build explorer URL based on network
  // Return full URL string
}
```

## Responsive Design

### Breakpoints (Tailwind)

- **Mobile** (< 768px): Single column, stacked sections
- **Tablet** (768px - 1024px): Two-column grid for details
- **Desktop** (> 1024px): Optimized spacing, wider content area

### Layout Strategy

**Mobile:**
```
[Header]
[Metadata]
[Details]
[Actions]
```

**Desktop:**
```
[Header          ]
[Metadata | Details]
[Actions         ]
```

### Responsive Patterns

- Use Tailwind's responsive utilities (`md:`, `lg:`)
- Ensure touch targets are minimum 44x44px on mobile
- Stack action buttons vertically on mobile
- Use responsive typography (text-base → text-lg)

## Error Handling

### Error Types

1. **Token Not Found**: Display message with retry option
2. **Network Error**: Display message with retry option
3. **Metadata Fetch Failed**: Show token info without metadata
4. **Clipboard Error**: Show toast notification

### Error Display Strategy

```typescript
function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  // Show error message based on error code
  // Provide retry button
  // Suggest alternative actions
}
```

### Graceful Degradation

- If metadata fails, show token info without image/description
- If clipboard API unavailable, show "Copy not supported" message
- If network slow, show loading state with timeout fallback


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Header displays complete token identity

*For any* valid TokenInfo object, when rendered in the TokenDetailsView, the header section should contain the token name, token symbol, and token address.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Metadata section displays content when metadata exists

*For any* TokenInfo with associated TokenMetadata, when rendered in the TokenDetailsView, the metadata section should display both the token image and the token description.

**Validates: Requirements 2.1, 2.2**

### Property 3: Metadata section displays placeholders when metadata is missing

*For any* TokenInfo without associated TokenMetadata, when rendered in the TokenDetailsView, the metadata section should display a placeholder image and a "no description available" message.

**Validates: Requirements 2.3, 2.4**

### Property 4: Metadata section appears before details section

*For any* rendered TokenDetailsView, the metadata section should appear in the DOM before the details section.

**Validates: Requirements 2.5**

### Property 5: Details section displays all technical information

*For any* valid TokenInfo object, when rendered in the TokenDetailsView, the details section should display the decimals, total supply, creator address, and transaction hash.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 6: Numeric values are formatted with separators

*For any* token supply value greater than 999, when displayed in the TokenDetailsView, the formatted string should contain thousand separators (commas).

**Validates: Requirements 3.5**

### Property 7: Copy button copies token address to clipboard

*For any* token address, when the user clicks the copy button adjacent to the address, the clipboard should contain the exact token address string.

**Validates: Requirements 4.2**

### Property 8: Copy button copies transaction hash to clipboard

*For any* transaction hash, when the user clicks the copy button adjacent to the hash, the clipboard should contain the exact transaction hash string.

**Validates: Requirements 5.2**

### Property 9: Copy operations display confirmation feedback

*For any* successful copy operation (address or transaction hash), the system should display a confirmation message to the user.

**Validates: Requirements 4.3, 5.3**

### Property 10: Mint button navigates with pre-populated address

*For any* token address, when the user clicks the mint button, the navigation should direct to the mint form with the token address included as a parameter.

**Validates: Requirements 6.2, 6.3**

### Property 11: Explorer button opens correct URL in new tab

*For any* token address and network configuration, when the user clicks the explorer button, the system should open the Stellar explorer URL for that token address in a new browser tab.

**Validates: Requirements 7.2, 7.3**

### Property 12: Error state displays error message

*For any* error that occurs during token data loading, the TokenDetailsView should display an error message that describes the failure.

**Validates: Requirements 9.2**

### Property 13: Retry triggers data reload

*For any* error state with a retry button, when the user clicks retry, the system should attempt to fetch the token data again.

**Validates: Requirements 9.4**

## Testing Strategy

### Dual Testing Approach

The Token Details View will be validated using both unit tests and property-based tests:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

We will use **fast-check** (already in package.json) for property-based testing in TypeScript.

**Configuration:**
- Each property test must run a minimum of 100 iterations
- Each test must be tagged with a comment referencing the design property
- Tag format: `// Feature: token-details-view, Property {number}: {property_text}`

**Example Property Test Structure:**

```typescript
import fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { TokenDetailsView } from './TokenDetailsView';

// Feature: token-details-view, Property 1: Header displays complete token identity
test('property: header displays complete token identity', () => {
  fc.assert(
    fc.property(
      tokenInfoGenerator(), // Custom generator for TokenInfo
      (tokenInfo) => {
        const { container } = render(<TokenDetailsView tokenAddress={tokenInfo.address} />);
        
        expect(screen.getByText(tokenInfo.name)).toBeInTheDocument();
        expect(screen.getByText(tokenInfo.symbol)).toBeInTheDocument();
        expect(screen.getByText(tokenInfo.address)).toBeInTheDocument();
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

Unit tests will focus on:

1. **Specific Examples**: Test with known token data to verify correct rendering
2. **Edge Cases**: 
   - Empty or very long token names
   - Missing metadata
   - Network errors
   - Clipboard API unavailable
3. **User Interactions**:
   - Button clicks
   - Copy operations
   - Navigation triggers
4. **Error Conditions**:
   - Token not found
   - Network failures
   - Invalid token addresses

### Integration Testing

Integration tests will verify:
- Data fetching from services
- Toast notifications appear correctly
- Navigation works with routing
- Clipboard operations with browser APIs

### Test Coverage Goals

- **Component rendering**: 100% of conditional rendering paths
- **User interactions**: All button clicks and user actions
- **Error handling**: All error types and recovery paths
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Testing Tools

- **Testing Library**: React Testing Library for component testing
- **fast-check**: Property-based testing library
- **Vitest**: Test runner (already configured)
- **jsdom**: DOM environment for tests

### Generators for Property Tests

Custom generators will be created for:
- `tokenInfoGenerator()`: Generates valid TokenInfo objects
- `tokenMetadataGenerator()`: Generates valid TokenMetadata objects
- `tokenAddressGenerator()`: Generates valid Stellar addresses
- `transactionHashGenerator()`: Generates valid transaction hashes

These generators will be added to `frontend/src/test/generators.ts` following the existing pattern.
