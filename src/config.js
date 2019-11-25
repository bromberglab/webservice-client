const serverUri =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000/api";

export default {
  debounceDefault: 500,
  prod: process.env.NODE_ENV === "production",
  serverUri: serverUri,
  apiUri: serverUri + "/v1",
  reteId: "bio-node@1.0.0",
  reteVersion: 1
};
