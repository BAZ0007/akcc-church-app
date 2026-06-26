import { task } from "@trigger.dev/sdk/v3";

export const helloWorld = task({
  id: "hello-world",
  run: async (payload: { message?: string }) => {
    const msg = payload.message ?? "AKCC Trigger.dev is live!";
    console.log("[hello-world]", msg);
    return { ok: true, echo: msg };
  },
});
