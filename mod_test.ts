import { getEndpoint } from "./mod.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";

const mf = new MockFetch();

import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
 
Deno.test("getEndpoint should return an endpoint URL from within the HTTP Link Header (absolute)", async () => {
  const url = "https://webmention.test/test/1";
  const expectedEndpoint = "https://webmention.test/test/1/webmention";

  mf.intercept(url, { method: "GET" }).response("ok", {
    status: 200,
    headers: { "Link": `<${expectedEndpoint}>; rel="webmention"` },
  });

  const endpoint = await getEndpoint(url);

  console.log(endpoint);
  assertEquals(endpoint, expectedEndpoint);
});