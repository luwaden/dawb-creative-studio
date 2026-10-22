import { getUserGoogleTokens, HttpError, requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, route } from "@/lib/server/http";
import { SheetsClient } from "@/lib/server/sheets";

export const dynamic = "force-dynamic";

/** Creates missing tabs + header columns and fills blank IDs. Admins only (it changes the spreadsheet's structure). */
export const POST = route(async (req: Request) => {
  assertSameOrigin(req);
  const user = await requireUser();
  if (!user.isAdmin) throw new HttpError(403, "Only admins can prepare the spreadsheet.");
  const client = await SheetsClient.create(await getUserGoogleTokens(req));
  return json(await client.setup());
});
