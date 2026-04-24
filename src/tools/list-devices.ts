import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  DevicesGetCollectionData,
  DevicesGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const platformEnum = z.enum(["IOS", "MAC_OS", "UNIVERSAL"]);
const statusEnum = z.enum(["ENABLED", "DISABLED"]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe("Maximum number of devices to return (default 100, max 200)"),
  "filter.platform": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by platform(s)"),
  "filter.status": z
    .union([statusEnum, z.array(statusEnum)])
    .optional()
    .describe("Filter by device status(es)"),
  "filter.name": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by device name(s)"),
  "filter.udid": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by UDID(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by device ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-devices",
  description: "Get a list of registered devices for development and testing",
  annotations: {
    title: "List devices",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listDevicesTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const query: NonNullable<DevicesGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.platform"])?.length && {
      "filter[platform]": toArray(args["filter.platform"])!,
    }),
    ...(toArray(args["filter.status"])?.length && {
      "filter[status]": toArray(args["filter.status"])!,
    }),
    ...(toArray(args["filter.name"])?.length && {
      "filter[name]": toArray(args["filter.name"])!,
    }),
    ...(toArray(args["filter.udid"])?.length && {
      "filter[udid]": toArray(args["filter.udid"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.Devices.devicesGetCollection({ query });
  const data = unwrapApiResult<DevicesGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
