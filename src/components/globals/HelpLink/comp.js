export default {
  methods: {
    click($event) {
      $event.preventDefault();
      var win = window.open("#/docs/" + this.page, "_blank");
      win.focus();
    }
  },
  props: ["page", "sm", "pad"]
};
