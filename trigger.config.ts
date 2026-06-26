import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  // Replace with your project ref from cloud.trigger.dev → project settings
  project: "proj_replace_me",
  dirs: ["./src/trigger"],
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
});
