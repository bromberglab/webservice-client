import Api from "src/services/api";
import Auth from "src/services/auth";
import Events from "src/services/events";

export default {
  methods: {
    showLogin() {
      this.$bvModal.show("login-modal");
    },
    login() {
      Events.$emit("start-loading");
      Api.post("login", {
        username: this.username,
        password: this.password
      }).then(r => {
        Events.$emit("stop-loading");
        this.success = r.data.success;
        this.reason = r.data.reason || "Wrong login.";
        if (r.data.success) {
          this.$bvModal.hide("login-modal");
          window.location.reload();
        }
      });
    },
    register() {
      Events.$emit("start-loading");
      Api.post("register", {
        username: this.username,
        email: this.email,
        password: this.password
      }).then(r => {
        Events.$emit("stop-loading");
        this.success = r.data.success;
        this.reason = r.data.reason || "Registering failed.";
        if (r.data.success) {
          this.$bvModal.hide("login-modal");
          this.$bvModal
            .msgBoxOk(
              "Your account needs to be reviewed. You have guest permissions until confirmation."
            )
            .then(() => {
              window.location.reload();
            });
        }
      });
    },
    guest() {
      Events.$emit("start-loading");
      Api.post("guestlogin", {}).then(r => {
        Events.$emit("stop-loading");
        this.success = r.data.success;
        this.reason = r.data.reason || "Can not login as guest.";
        if (r.data.success) {
          this.$bvModal.hide("login-modal");
          window.location.reload();
        }
      });
    }
  },
  mounted() {
    Auth.loginModal = this;
  },
  data() {
    return {
      Auth,
      username: "",
      password: "",
      email: "",
      success: true,
      reason: "All good"
    };
  }
};
