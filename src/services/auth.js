import Api from "src/services/api";

export default {
  userId: null,
  init(then) {
    Api.get("check_auth").then(response => {
      Object.keys(response.data).forEach(k => {
        this[k] = response.data[k];
      });

      this.userId = this.user;

      then();
    });
  },
  showLogin() {
    this.loginModal.showLogin();
  },
  logout() {
    Api.post("logout").then(() => {
      window.location.reload();
    });
  },
  loginModal: {}
};
