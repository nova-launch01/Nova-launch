import { useState } from "react";
import type { FormEvent } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmail("");
  };

  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        className="h-11 w-full rounded-card border border-border-medium bg-background-elevated px-4 text-sm text-text-primary outline-none ring-0 transition focus:border-primary"
        required
      />
      <button
        type="submit"
        className="h-11 whitespace-nowrap rounded-card bg-primary px-5 text-sm font-semibold text-text-primary transition hover:opacity-90 hover:shadow-glow-red"
      >
        Join updates
      </button>
    </form>
  );
}
