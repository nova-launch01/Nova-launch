# TokenDeployForm Component

Multi-step form component for deploying tokens on the Stellar network.

## Features

- **3-Step Process**: Basic Info → Metadata → Review
- **Progress Indicator**: Visual step tracker with navigation
- **Form Validation**: Real-time validation with error messages
- **State Persistence**: Form data persists when navigating between steps
- **Fee Calculation**: Automatic fee calculation based on selected features
- **Image Upload**: Optional token image with preview
- **Responsive Design**: Works on all screen sizes

## Usage

```tsx
import { TokenDeployForm } from './components/TokenDeployForm';

function App() {
  return <TokenDeployForm />;
}
```

## Steps

### Step 1: Basic Info
Collects fundamental token parameters:
- Token Name (1-32 alphanumeric characters)
- Token Symbol (1-12 uppercase letters)
- Decimals (0-18, typically 7 for Stellar)
- Initial Supply (positive number)
- Admin Wallet Address (valid Stellar address)

### Step 2: Metadata (Optional)
Allows adding optional metadata:
- Token Image (PNG, JPG, or SVG, max 5MB)
- Description (max 500 characters)
- Adds 3 XLM to deployment fee

### Step 3: Review & Confirm
Displays all entered information:
- Token details summary
- Metadata preview (if provided)
- Fee breakdown (base + metadata)
- Deploy button with loading state
- Success confirmation

## Navigation

- **Next/Back buttons**: Navigate between steps
- **Progress indicator**: Click on completed steps to jump back
- **Skip Metadata**: Option to skip optional metadata step
- **Edit Previous Steps**: Can go back to edit any previous step

## Fee Structure

- Base deployment fee: 7 XLM
- Metadata fee (optional): 3 XLM
- Total fee displayed in review step

## Validation

All inputs are validated according to Stellar token standards:
- Real-time validation on blur
- Error messages displayed inline
- Form submission blocked if validation fails
- Image file type and size validation

## State Management

Form state is managed internally using React hooks:
- `useState` for form data and current step
- State persists when navigating between steps
- Can edit previous steps without losing data

## Components

- `index.tsx` - Main form container with state management
- `BasicInfoStep.tsx` - Step 1: Basic token information
- `MetadataStep.tsx` - Step 2: Optional metadata
- `ReviewStep.tsx` - Step 3: Review and deploy
- `ProgressIndicator.tsx` - Visual step progress tracker

## Integration Points

The form is ready for integration with:
- Wallet connection (pass wallet address to form)
- Stellar SDK (implement `handleDeploy` function)
- IPFS service (upload metadata in deploy function)
- Transaction history (store deployment results)

## TODO

- [ ] Integrate with wallet connection
- [ ] Implement actual token deployment
- [ ] Add IPFS metadata upload
- [ ] Add transaction status tracking
- [ ] Add error handling for deployment failures
- [ ] Add success state with transaction details
