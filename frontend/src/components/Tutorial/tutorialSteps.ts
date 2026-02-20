import type { TutorialStep } from './TutorialOverlay';

export const deploymentTutorialSteps: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Stellar Token Deployer! 👋',
        content:
            'This quick tutorial will guide you through deploying your first token on the Stellar network. It only takes a few minutes!',
        position: 'bottom',
    },
    {
        id: 'connect-wallet',
        title: 'Step 1: Connect Your Wallet',
        content:
            'First, you need to connect your Stellar wallet. Click the "Connect Wallet" button in the top right corner to get started.',
        targetSelector: '[data-tutorial="connect-wallet"]',
        position: 'bottom',
    },
    {
        id: 'token-details',
        title: 'Step 2: Fill in Token Details',
        content:
            'Enter your token information including name, symbol, decimals, and initial supply. These details define your token\'s identity and properties.',
        targetSelector: '[data-tutorial="token-form"]',
        position: 'top',
    },
    {
        id: 'review-deploy',
        title: 'Step 3: Review and Deploy',
        content:
            'After filling in the details, review your token configuration and deployment fees. When ready, click "Deploy Token" to submit the transaction.',
        targetSelector: '[data-tutorial="deploy-button"]',
        position: 'top',
    },
    {
        id: 'view-token',
        title: 'Step 4: View Your Deployed Token',
        content:
            'Once deployed, you\'ll see your token address and transaction details. You can deploy additional tokens or view your deployment history.',
        position: 'bottom',
    },
    {
        id: 'complete',
        title: 'You\'re All Set! 🚀',
        content:
            'That\'s it! You now know how to deploy tokens on Stellar. Feel free to explore the app and deploy your first token whenever you\'re ready.',
        position: 'bottom',
    },
];
