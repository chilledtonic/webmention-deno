# Webmention Deno 🦕📤

This is a straightforward [webmention](https://www.w3.org/TR/webmention/) sending and endpoint discovery implementation.

It has a single "external" dependency, which is [Deno DOM](https://deno.land/x/deno_dom). It uses this library to find the webmention endpoint within a page.

It passes the test suite listed at [webmention.rocks](https://webmention.rocks/).

# Usage

```
import {
  getEndpoint,
  webmention,
} from "https://deno.land/x/webmention/mod.ts";

getEndpoint("https://webmention.rocks/test/1");
// Returns "https://webmention.rocks/test/1"

webmention(source, target);

// Returns with:
//{
//    status: response.status,
//    source: source,
//    target: response.url,
//};

```