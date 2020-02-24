import Api from "src/services/api";

export default {
  methods: {
    deleteRow(r) {
      this.$bvModal.msgBoxConfirm("Are you sure?").then(value => {
        if (!value) return;
        Api.delete("api_workflow", { uuid: r.item.uuid }).then(() => {
          window.location.reload();
        });
      });
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
        { key: "actions" }
      ],
      items: []
    };
  }
};
