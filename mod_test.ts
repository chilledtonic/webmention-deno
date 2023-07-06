import { getEndpoint, webmention } from "./mod.ts";
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

Deno.test("Webmention gets endpoint & fires correctly", async () => {
  const source = "https://webmention.test/source";
  const target = "https://webmention.test/target"
  const endpoint = "https://webmention.test/webmention";

  mf.intercept(target, { method: "GET" }).response("ok", {
    status: 200,
    headers: { "Link": `<${endpoint}>; rel="webmention"` },
  });

  mf.intercept(endpoint, { method: "POST" }).response("ok", {
    status: 202,
  });

  const result = await webmention(source, target);
  console.log(result)
  assertEquals(result?.status, 202);

});

// POST /webmention-endpoint HTTP/1.1
// Host: aaronpk.example
// Content-Type: application/x-www-form-urlencoded

// source=https://waterpigs.example/post-by-barnaby&
// target=https://aaronpk.example/post-by-aaron


// HTTP/1.1 202 Accepted