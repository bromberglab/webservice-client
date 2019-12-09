import GraphEditor from "../GraphEditor/comp.vue";
import Api from "src/services/api";
import Store from "src/services/store";

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
    loadWorkflow(pk) {
      Api.get("workflow_storage", {
        pk
      }).then(r => {
        r.data.pk = pk;
        this.workflow = r.data;
      });
    },
    loadTemplate(w) {
      Store.graphLoadTemplate = w.name;
      this.$router.push("/editor/");
    },
    setWorkflow(w) {
      if (!w.should_run) return this.loadTemplate(w);

      this.$router.push("/workflows/" + w.pk);
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
