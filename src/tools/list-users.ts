import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  UsersGetCollectionData,
  UsersGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const roleEnum = z.enum([
  "ADMIN",
  "FINANCE",
  "ACCOUNT_HOLDER",
  "SALES",
  "MARKETING",
  "APP_MANAGER",
  "DEVELOPER",
  "ACCESS_TO_REPORTS",
  "CUSTOMER_SUPPORT",
  "CREATE_APPS",
  "CLOUD_MANAGED_DEVELOPER_ID",
  "CLOUD_MANAGED_APP_DISTRIBUTION",
  "GENERATE_INDIVIDUAL_KEYS",
]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe("Maximum number of users to return (default 100, max 200)"),
  "filter.username": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by username(s)"),
  "filter.roles": z
    .union([roleEnum, z.array(roleEnum)])
    .optional()
    .describe("Filter by role(s)"),
  "filter.visibleApps": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by visible app ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-users",
  description: "Get a list of team members (users) in your App Store Connect team",
  annotations: {
    title: "List users",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listUsersTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const query: NonNullable<UsersGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.username"])?.length && {
      "filter[username]": toArray(args["filter.username"])!,
    }),
    ...(toArray(args["filter.roles"])?.length && {
      "filter[roles]": toArray(args["filter.roles"])!,
    }),
    ...(toArray(args["filter.visibleApps"])?.length && {
      "filter[visibleApps]": toArray(args["filter.visibleApps"])!,
    }),
  };
  const result = await client.api.Users.usersGetCollection({ query });
  const data = unwrapApiResult<UsersGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
