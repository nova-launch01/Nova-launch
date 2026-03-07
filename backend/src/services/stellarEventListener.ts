import axios from "axios";
import { WebhookEventType } from "../types/webhook";
import webhookDeliveryService from "./webhookDeliveryService";
import { PrismaClient } from "@prisma/client";
import { GovernanceEventParser } from "./governanceEventParser";
import governanceEventMapper from "./governanceEventMapper";

const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
const FACTORY_CONTRACT_ID = process.env.FACTORY_CONTRACT_ID || "";
const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

interface StellarEvent {
  type: string;
  ledger: number;
  ledger_close_time: string;
  contract_id: string;
  id: string;
  paging_token: string;
  topic: string[];
  value: any;
  in_successful_contract_call: boolean;
  transaction_hash: string;
}

export class StellarEventListener {
  private isRunning = false;
  private lastCursor: string | null = null;
  private prisma: PrismaClient;
  private governanceParser: GovernanceEventParser;

  constructor() {
    this.prisma = new PrismaClient();
    this.governanceParser = new GovernanceEventParser(this.prisma);
  }

  /**
   * Start listening for Stellar events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("Event listener is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting Stellar event listener...");

    // Start polling loop
    this.pollEvents();
  }

  /**
   * Stop listening for events
   */
  stop(): void {
    this.isRunning = false;
    console.log("Stopping Stellar event listener...");
  }

  /**
   * Poll for new events
   */
  private async pollEvents(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.fetchAndProcessEvents();
      } catch (error) {
        console.error("Error polling events:", error);
      }

      // Wait before next poll
      await this.delay(POLL_INTERVAL_MS);
    }
  }

  /**
   * Fetch and process new events from Horizon
   */
  private async fetchAndProcessEvents(): Promise<void> {
    try {
      const url = `${HORIZON_URL}/contracts/${FACTORY_CONTRACT_ID}/events`;
      const params: any = {
        limit: 100,
        order: "asc",
      };

      if (this.lastCursor) {
        params.cursor = this.lastCursor;
      }

      const response = await axios.get(url, { params });
      const events: StellarEvent[] = response.data._embedded?.records || [];

      if (events.length === 0) {
        return;
      }

      console.log(`Processing ${events.length} new events`);

      for (const event of events) {
        await this.processEvent(event);
        this.lastCursor = event.paging_token;
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: StellarEvent): Promise<void> {
    try {
      // Check if this is a governance event
      if (governanceEventMapper.isGovernanceEvent(event)) {
        const governanceEvent = governanceEventMapper.mapEvent(event);
        if (governanceEvent) {
          await this.governanceParser.parseEvent(governanceEvent);
          console.log(`Processed governance event: ${governanceEvent.type}`);
        }
        return;
      }

      // Parse event topic to determine event type
      const eventType = this.parseEventType(event);

      // Extract event data based on type
      const eventData = this.extractEventData(event, eventType);

      if (!eventData) {
        return;
      }

      // Trigger webhooks only if we have a webhook event type
      if (eventType) {
        await webhookDeliveryService.triggerEvent(
          eventType,
          eventData,
          eventData.tokenAddress
        );
      }
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }

  /**
   * Parse event type from Stellar event
   */
  private parseEventType(event: StellarEvent): WebhookEventType | null {
    // Event topics are typically structured as [event_name, ...]
    if (event.topic.length < 1) {
      return null;
    }

    const eventName = event.topic[0];

    switch (eventName) {
      case "tok_burn":
        return WebhookEventType.TOKEN_BURN_SELF;

      case "adm_burn":
        return WebhookEventType.TOKEN_BURN_ADMIN;

      case "tok_reg":
        return WebhookEventType.TOKEN_CREATED;

      case "adm_xfer":
      case "adm_prop":
        // Both admin transfer and admin proposed are admin-related events
        return null; // No webhook type defined yet, but parse successfully

      default:
        return null;
    }
  }

  /**
   * Extract event data from Stellar event
   */
  private extractEventData(
    event: StellarEvent,
    eventType: WebhookEventType | null
  ): any {
    const baseData = {
      transactionHash: event.transaction_hash,
      ledger: event.ledger,
    };

    if (!eventType) {
      // Return base data for events without specific webhook types
      return baseData;
    }

    switch (eventType) {
      case WebhookEventType.TOKEN_BURN_SELF:
        return {
          ...baseData,
          tokenAddress: event.topic[1] || "",
          from: event.value?.from || "",
          amount: event.value?.amount?.toString() || "0",
          burner: event.value?.burner || event.value?.from || "",
        };

      case WebhookEventType.TOKEN_BURN_ADMIN:
        return {
          ...baseData,
          tokenAddress: event.topic[1] || "",
          from: event.value?.from || "",
          amount: event.value?.amount?.toString() || "0",
          admin: event.value?.admin || "",
        };

      case WebhookEventType.TOKEN_CREATED:
        return {
          ...baseData,
          tokenAddress: event.topic[1] || "",
          creator: event.value?.creator || "",
          name: event.value?.name || "",
          symbol: event.value?.symbol || "",
          decimals: event.value?.decimals || 7,
          initialSupply: event.value?.initial_supply?.toString() || "0",
        };

      case WebhookEventType.TOKEN_METADATA_UPDATED:
        return {
          ...baseData,
          tokenAddress: event.topic[1] || "",
          metadataUri: event.value?.metadata_uri || "",
          updatedBy: event.value?.updated_by || "",
        };

      default:
        return baseData;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new StellarEventListener();
