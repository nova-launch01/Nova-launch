import { useEffect, useState, lazy } from "react";
import { Header, Container } from "./components/Layout";
import { Button, Card, ErrorBoundary } from "./components/UI";
import {
  PWAInstallButton,
  PWAUpdateNotification,
  PWAConnectionStatus,
} from "./components/PWA";
import { TokenDeployForm } from "./components/TokenDeployForm";
import {
  TutorialOverlay,
  CompletionCelebration,
  useTutorial,
  deploymentTutorialSteps,
} from "./components/Tutorial";
import { useWallet } from "./hooks/useWallet";
import { truncateAddress } from "./utils/formatting";

const HomeRoute = lazy(() => import("./routes/HomeRoute"));
const NotFoundRoute = lazy(() => import("./routes/NotFoundRoute"));

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
}

function App() {
  const { wallet, connect, disconnect, isConnecting, error } = useWallet();
  const [showCelebration, setShowCelebration] = useState(false);
  const tutorial = useTutorial(deploymentTutorialSteps);

  const handleTutorialComplete = () => {
    tutorial.complete();
    setShowCelebration(true);
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  useEffect(() => {
    // Auto-start tutorial for first-time users
    if (!tutorial.hasCompletedBefore) {
      const timer = setTimeout(() => {
        tutorial.start();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tutorial.hasCompletedBefore]);

  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <div className="min-h-screen bg-gray-50">
        <Header>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            <PWAConnectionStatus />
            <PWAInstallButton />
            {!tutorial.hasCompletedBefore && (
              <Button
                variant="outline"
                size="sm"
                onClick={tutorial.start}
                data-tutorial="restart-tutorial"
              >
                Start Tutorial
              </Button>
            )}
            {wallet.connected && wallet.address ? (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled>
                  {truncateAddress(wallet.address)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  data-tutorial="connect-wallet"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => void connect()}
                loading={isConnecting}
                data-tutorial="connect-wallet"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </Header>
        <main id="main-content">
          <Container>
            <Card title="Deploy Your Token">
              {error ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <TokenDeployForm
                wallet={wallet}
                onConnectWallet={connect}
                isConnectingWallet={isConnecting}
              />
            </Card>
          </Container>
        </main>
        <PWAUpdateNotification />

        {/* Tutorial System */}
        <TutorialOverlay
          steps={deploymentTutorialSteps}
          currentStep={tutorial.currentStep}
          onNext={tutorial.next}
          onPrevious={tutorial.previous}
          onSkip={tutorial.skip}
          onComplete={handleTutorialComplete}
          isActive={tutorial.isActive}
        />
        <CompletionCelebration isOpen={showCelebration} onClose={handleCelebrationClose} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
