/**
 * Widget entry point — the code that runs when the <script> tag loads.
 * This script reads configuration from the script tag's data attributes, defines the custom element, and appends it to the page.
 */
import { ChatWidget } from "./widget";
import { WidgetConfig } from "./types";

(function () {
  // Capture the script element — must be done synchronously at load time
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) {
    console.error(
      "[ChatWidget] Could not find script element. Make sure the script is not loaded as a module.",
    );
    return;
  }

  // Read configuration from data attributes
  const apiKey = script.getAttribute("data-api-key");
  const apiUrl = script.getAttribute("data-api-url");

  if (!apiKey || !apiUrl) {
    console.error(
      "[ChatWidget] Missing required attributes: data-api-key and data-api-url",
    );
    return;
  }

  const config: WidgetConfig = {
    apiKey,
    apiUrl: apiUrl.replace(/\/$/, ""), // Strip trailing slash
    position:
      (script.getAttribute("data-position") as WidgetConfig["position"]) ||
      "bottom-right",
  };

  // Register the custom element (only once)
  if (!customElements.get("chat-widget")) {
    customElements.define(
      "chat-widget",
      class extends ChatWidget {
        constructor() {
          super(config);
        }
      },
    );
  }

  // Create and append the widget to the page
  const widget = document.createElement("chat-widget");
  document.body.appendChild(widget);
})();
