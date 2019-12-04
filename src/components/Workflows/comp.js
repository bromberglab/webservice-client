import GraphEditor from "../GraphEditor/comp.vue";
import Api from "src/services/api";

export default {
  components: {
    GraphEditor
  },
  methods: {
    refresh() {
      const path = this.$route.params.path;

      if (path) {
        return this.loadWorkflow(path);
      }

      this.workflow = null;

      Api.get("workflows").then(r => {
        r.data.sort(
          (a, b) =>
            (a.should_run ? 1 : 0) - (b.should_run ? 1 : 0) ||
            (a.updated_at < b.updated_at ? 1 : -1)
        );

        this.workflows = r.data;
      });
    },
    loadWorkflow(name) {
      Api.get("workflow_storage", {
        name
      }).then(r => {
        r.data.name = name;
        this.workflow = r.data;
      });
    },
    setWorkflow(w) {
      if (!w.should_run) return;

      this.$router.push("/workflows/" + w.name);
    }
  },
  data() {
    return {
      workflow: null,
      workflows: []
    };
  },
  mounted() {
    this.refresh();
  },
  watch: {
    $route() {
      this.refresh();
    }
  }
};
