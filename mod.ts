import {
  DOMParser,
} from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export async function getEndpoint(url: string): Promise<string | undefined> {
  try {
    // Fetch the HTML content of the provided URL
    const response = await fetch(url, { redirect: "follow" });
    const finalURL = response.url;
    const headers = await response.headers;
    const linkHeader = headers.get("link");
    if (linkHeader) {
      const regex =
        /<([^>]+)>;\s*rel=(?:(?:"webmention[\s\w]*"|'webmention[\s\w]*'|webmention[\s\w]*|["']https?:\/\/webmention\.org\/?["'])\s*)+/g;

      const match = regex.exec(linkHeader);

      if (match && match[1]) {
        if (!finalURL) {
          const endpointURL = new URL(match[1]).href;
          return endpointURL;
        } else {
          const endpointURL = new URL(match[1], finalURL).href;
          return endpointURL;
        }
      }
    } else {
      const html = await response.text();

      // Parse the HTML content using JSDOM
      const document = new DOMParser().parseFromString(html, "text/html");

      if (document === null) throw new Error("Failed to parse HTML");
      // Find the Webmention endpoint
      const endpointElement = document.querySelector(
        'link[rel~="webmention"][href], a[rel~="webmention"][href]',
      );

      if (endpointElement !== null) {
        // Extract the Webmention endpoint URL
        const href = endpointElement.getAttribute("href");
        if (!href) throw new Error("No href attribute found");
        const endpointURL = new URL(href, finalURL).href;
        return endpointURL;
      } else {
        console.log("No endpoint found");
        throw new Error("No endpoint found");
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function webmention(
  source: string,
  target: string,
): Promise<{ status: number; source: string; target: string } | undefined> {
  const payload = {
    source: source,
    target: target,
  };
  const endpoint = await getEndpoint(target);
  if (!endpoint) {
    console.error("No endpoint found");
    return;
  }
  try {
    console.log("Sending webmention to", endpoint);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(payload),
    });

    const reply = {
      status: response.status,
      source: source,
      target: response.url,
    };

    if (response.ok) {
      return reply;
    } else {
      console.error(
        "Failed to send webmention:",
        response.status,
        response.statusText,
      );
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
