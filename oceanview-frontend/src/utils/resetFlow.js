const FLOW_KEY = "ov_reset_flow";
const ALLOW_FORGOT_KEY = "ov_allow_forgot";

export function allowForgotFromLogin() {
  sessionStorage.setItem(ALLOW_FORGOT_KEY, "1");
}

export function consumeAllowForgot() {
  const ok = sessionStorage.getItem(ALLOW_FORGOT_KEY) === "1";
  sessionStorage.removeItem(ALLOW_FORGOT_KEY);
  return ok;
}

export function clearResetFlow() {
  sessionStorage.removeItem(FLOW_KEY);
}

export function startResetFlow(email) {
  sessionStorage.setItem(FLOW_KEY, JSON.stringify({ step: 1, email }));
}

export function setOtpStep(otp) {
  const flow = getResetFlow();
  if (!flow?.email) return;
  sessionStorage.setItem(
    FLOW_KEY,
    JSON.stringify({ ...flow, step: 2, otp })
  );
}

export function getResetFlow() {
  try {
    return JSON.parse(sessionStorage.getItem(FLOW_KEY) || "null");
  } catch {
    return null;
  }
}