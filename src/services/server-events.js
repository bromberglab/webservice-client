import Vue from "vue";
import Events from "src/services/events";
import Config from "src/config";

export default {
  sse: null,
  disconnect() {
    this.sse && this.sse.close();
  },
  listen() {
    this.disconnect();
    this.sse = null;
    Vue.SSE(Config.apiUri + "/events/", { format: "json" })
      .then(sse => {
        if (this.sse !== null) return sse.close();
        this.sse = sse;
        // Listen for messages based on their event (in this case, "chat")
        sse.subscribe("event", message => {
          Events.$emit("server-event", message);
          Events.$emit("server-event/" + message.type, message.data);
        });
        // Catch any errors (ie. lost connections, etc.)
        sse.onError(e => {
          this.errors(e);
        });
      })
      .catch(e => {
        this.errors(e);
      });
  },
  errors(_) {
    // console.warn("lost connection; reconnecting", e);
    this.disconnect();
    setTimeout(() => {
      this.listen();
    }, 2000);
  }
};
