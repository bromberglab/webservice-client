import Api from "src/services/api";

export default {
  methods: {
    deleteRow(r) {
      this.$bvModal.msgBoxConfirm("Are you sure?").then(value => {
        if (!value) return;
        Api.delete("uploads/" + r.item.uuid).then(() => {
          window.location.reload();
        });
      });
    }
  },
  mounted() {
    Api.get("uploads").then(r => {
      this.items = r.data;
    });
  },
  data() {
    return {
      fields: [
        { key: "display_name", label: "Name", sortable: 1 },
        { key: "file_type", sortable: 1 },
        {
          key: "started_at",
          label: "Time",
          formatter: v => {
            return v.slice(0, 16).replace("T", " at ");
          },
          sortable: 1
        },
        {
          key: "is_newest",
          label: "Outdated",
          formatter: v => !v,
          sortable: 1
        },
        {
          key: "size",
          formatter: v => {
            let i = 0;
            while (v > 1000) {
              i += 1;
              v /= 1000;
            }
            return ~~v + ["", "K", "M", "G", "T", "P"][i];
          },
          sortable: 1
        },
        { key: "actions" }
      ],
      items: []
    };
  }
};
