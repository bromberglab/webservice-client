const axios = require("axios");
import Config from "src/config";
axios.defaults.withCredentials = true;

export default {
  uri: Config.apiUri,
  endpointToUrl(endpoint) {
    return Config.apiUri + "/" + endpoint + "/";
  },
  callEndpoint(method, endpoint, data) {
    return method(this.endpointToUrl(endpoint), data);
  },
  get(endpoint, data) {
    return this.callEndpoint(axios.get, endpoint, { params: data });
  },
  post(endpoint, data) {
    return this.callEndpoint(axios.post, endpoint, data);
  },
  put(endpoint, data) {
    return this.callEndpoint(axios.put, endpoint, data);
  },
  delete(endpoint, data) {
    return this.callEndpoint(axios.delete, endpoint, { data });
  },

  legacySupport(nodes) {
    let v = nodes.id;
    v = ~~v; // convert to int, 'demo@0.1.0' becomes 0

    if (v === 0) {
      v++;
      // Inputs and Outputs changed in this version

      for (const [_, n] of Object.entries(nodes.nodes)) {
        if (!n.name.startsWith("node")) {
          let name = n.name.split("/")[0];
          let type = n.name.slice(name.length + 1);
          n.name = name;
          n.data.type = type;
        }
      }
    }
    if (v === 1) {
      v++;
      // current version
    }

    nodes.id = Config.reteId;
    return nodes;
  }
};
