import GraphEditor from "../GraphEditor/comp.vue";
import Api from "src/services/api";

export default {
  components: {
    GraphEditor
  },
  methods: {
    loadWorkflow(name) {
      Api.get("workflow_storage", {
        name
      }).then(r => {
        this.workflow = r.data;
      });
    }
  },
  data() {
    return {
      workflow: null
    };
  },
  mounted() {
    const path = this.$route.params.path;

    if (path) {
      this.loadWorkflow(path);
    }
  }
};
