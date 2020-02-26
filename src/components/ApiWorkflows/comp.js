import Api from "src/services/api";
import Store from "src/services/store";

export default {
  methods: {
    deleteRow(r) {
      this.$bvModal.msgBoxConfirm("Are you sure?").then(value => {
        if (!value) return;
        Api.delete("api_workflow", { uuid: r.item.uuid }).then(() => {
          window.location.reload();
        });
      });
    },
    load(r) {
      Store.graphLoadTemplate = "API/" + r.item.uuid;
      this.$router.push("/editor/");
    }
  },
  mounted() {
    Api.get("api_workflow").then(r => {
      this.items = r.data;
    });
  },
  data() {
    return {
      fields: [
        { key: "uuid", label: "API Key", sortable: 1 },
        {
          key: "created_at",
          label: "Creation [UTC]",
          formatter: v => {
            return v.slice(0, 16).replace("T", " at ");
          },
          sortable: 1
        },
        {
          key: "run_at",
          label: "Last Run [UTC]",
          formatter: v => {
            return v.slice(0, 16).replace("T", " at ");
          },
          sortable: 1
        },
        { key: "user" },
        { key: "actions" }
      ],
      items: []
    };
  }
};
