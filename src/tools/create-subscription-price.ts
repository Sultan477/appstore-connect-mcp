import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionPriceCreateRequest,
  SubscriptionPricesCreateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  subscriptionId: z
    .string()
    .describe(
      "Subscription ID (from create-subscription or list-subscription-group-subscriptions)"
    ),
  subscriptionPricePointId: z
    .string()
    .describe(
      "Price point ID from list-subscription-price-points for this subscription."
    ),
  territoryId: z
    .string()
    .optional()
    .describe(
      "Territory ID (e.g. USA). When the price point came from list-subscription-price-points with filter.territory, pass that same territory here. Required by API for territory-specific price points; omit only if applying to all."
    ),
  startDate: z
    .string()
    .optional()
    .describe(
      "ISO 8601 date when this price becomes effective. Omit for immediate."
    ),
  preserveCurrentPrice: z
    .boolean()
    .optional()
    .describe(
      "If true, existing subscribers keep their current price when you add a new price"
    ),
};

export const metadata: ToolMetadata = {
  name: "create-subscription-price",
  description:
    "Attach a price to a subscription (by price point and optionally territory). Set subscription availability first with create-subscription-availability for the territory, or you may get 409 ENTITY_ERROR.RELATIONSHIP.INVALID. Use price point IDs from list-subscription-price-points; when you used filter.territory there, pass that same territoryId here.",
  annotations: {
    title: "Create subscription price",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createSubscriptionPriceTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const body: SubscriptionPriceCreateRequest = {
    data: {
      type: "subscriptionPrices",
      attributes: {
        ...(args.startDate !== undefined && { startDate: args.startDate }),
        ...(args.preserveCurrentPrice !== undefined && {
          preserveCurrentPrice: args.preserveCurrentPrice,
        }),
      },
      relationships: {
        subscription: {
          data: { type: "subscriptions", id: args.subscriptionId },
        },
        subscriptionPricePoint: {
          data: {
            type: "subscriptionPricePoints",
            id: args.subscriptionPricePointId,
          },
        },
        ...(args.territoryId && {
          territory: {
            data: { type: "territories", id: args.territoryId },
          },
        }),
      },
    },
  };
  const result =
    await client.api.SubscriptionPrices.subscriptionPricesCreateInstance({
      body,
    });
  const data = unwrapApiResult<SubscriptionPricesCreateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
