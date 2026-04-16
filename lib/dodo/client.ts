import DodoPayments from "dodopayments";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY,
  webhookKey: process.env.DODO_WEBHOOK_SECRET,
  environment: process.env.DODO_TEST_MODE === "true" ? "test_mode" : "live_mode",
});

export default dodo;
