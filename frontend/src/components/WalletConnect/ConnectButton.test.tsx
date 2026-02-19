import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConnectButton } from "./ConnectButton";

// Mock the useToast hook
vi.mock("../../hooks/useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe("ConnectButton", () => {
  beforeEach(() => {
    // Clear window.freighter before each test
    if (typeof window !== "undefined") {
      const win = window as unknown as Record<string, unknown>;
      delete win.freighter;
    }
  });

  it("renders connect button in disconnected state", () => {
    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    expect(button).toBeInTheDocument();
  });

  it("shows loading state while connecting", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.freighter = {
      requestPublicKey: vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ publicKey: "GBBD47" }), 100),
          ),
      ),
    };

    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    const connectingButton = screen.getByRole("button", {
      name: "Connecting...",
    });
    expect(connectingButton).toBeInTheDocument();
  });

  it("shows error when Freighter is not installed", async () => {
    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Connection Error")).toBeInTheDocument();
      expect(
        screen.getByText(/Freighter wallet not installed/),
      ).toBeInTheDocument();
    });
  });

  it("displays Freighter installation link when not installed", async () => {
    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    await waitFor(() => {
      const link = screen.getByRole("link", {
        name: "Install Freighter wallet",
      });
      expect(link).toHaveAttribute("href", "https://freighter.app/");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  it("calls onConnect callback with public key when connected successfully", async () => {
    const onConnect = vi.fn();
    const win = window as unknown as Record<string, unknown>;
    win.freighter = {
      requestPublicKey: vi.fn(() => Promise.resolve({ publicKey: "GB7Z" })),
    };

    render(<ConnectButton onConnect={onConnect} />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onConnect).toHaveBeenCalledWith("GB7Z");
    });
  });

  it("shows disconnect button when connected", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.freighter = {
      requestPublicKey: vi.fn(() => Promise.resolve({ publicKey: "GB7ZXA" })),
    };

    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    await waitFor(() => {
      const disconnectButtons = screen.getAllByRole("button", {
        name: "Disconnect wallet",
      });
      expect(disconnectButtons.length).toBeGreaterThan(0);
    });
  });

  it("disconnects wallet when disconnect button is clicked", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.freighter = {
      requestPublicKey: vi.fn(() => Promise.resolve({ publicKey: "GB7ZXA" })),
    };

    render(<ConnectButton />);
    const connectButton = screen.getByRole("button", {
      name: "Connect Wallet",
    });
    fireEvent.click(connectButton);

    await waitFor(() => {
      const disconnectButtons = screen.getAllByRole("button", {
        name: "Disconnect wallet",
      });
      expect(disconnectButtons.length).toBeGreaterThan(0);
    });

    const disconnectButtons = screen.getAllByRole("button", {
      name: "Disconnect wallet",
    });
    fireEvent.click(disconnectButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Connect Wallet" }),
      ).toBeInTheDocument();
    });
  });

  it("has proper accessibility attributes", () => {
    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    expect(button).toHaveAttribute("aria-label", "Connect Wallet");
    expect(button).toHaveAttribute("aria-busy", "false");
  });

  it("sets aria-busy to true during connection", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.freighter = {
      requestPublicKey: vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ publicKey: "GB7ZXA" }), 500),
          ),
      ),
    };

    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    const connectingButton = screen.getByRole("button", {
      name: "Connecting...",
    });
    expect(connectingButton).toHaveAttribute("aria-busy", "true");
  });

  it("displays error message with aria-live for accessibility", async () => {
    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    await waitFor(() => {
      const errorDiv = screen.getByRole("alert");
      expect(errorDiv).toHaveAttribute("aria-live", "polite");
    });
  });

  it("responsive: shows shortened display on mobile", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.freighter = {
      requestPublicKey: vi.fn(() =>
        Promise.resolve({
          publicKey: "GBBD47HRSOVUQY5RWABXBQXF2EHHFWWSWP2RGWQWZ2UGLJMVX3JBQNPM",
        }),
      ),
    };

    render(<ConnectButton />);
    const button = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(button);

    await waitFor(() => {
      // Check mobile button exists with class
      const mobileButton = screen.getByRole("button", {
        name: "Connected wallet",
      });
      expect(mobileButton).toHaveClass("sm:hidden");
    });
  });
});
