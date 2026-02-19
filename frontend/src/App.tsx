import { Header, Container } from "./components/Layout";
import { Card, ErrorBoundary } from "./components/UI";
import { ConnectButton } from "./components/WalletConnect";

function App() {
  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <div className="min-h-screen bg-gray-50">
        <Header>
          <ConnectButton />
        </Header>
        <main id="main-content">
          <Container>
            <Card title="Deploy Your Token">
              <p className="text-gray-600">
                Welcome to Stellar Token Deployer. Connect your wallet to get
                started.
              </p>
            </Card>
          </Container>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
