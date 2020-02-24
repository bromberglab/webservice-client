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
  },

  idMapping(map, old) {
    if (map[old] === undefined) {
      map[old] = Object.keys(map).length + 1;
    }
    return map[old];
  },
  refreshIDs(nodes) {
    let refreshed = {};
    let idMap = {};

    for (const [i, n] of Object.entries(nodes.nodes)) {
      for (const [_, p] of Object.entries(n.inputs)) {
        p.connections.forEach(c => {
          c.node = this.idMapping(idMap, c.node);
        });
      }
      for (const [_, p] of Object.entries(n.outputs)) {
        p.connections.forEach(c => {
          c.node = this.idMapping(idMap, c.node);
        });
      }
      n.id = this.idMapping(idMap, i);
      refreshed["" + this.idMapping(idMap, i)] = n;
    }

    nodes.nodes = refreshed;
    return nodes;
  },
  prepareDataForRun(data) {
    data = JSON.parse(JSON.stringify(data)); // otherwise the actual node data in rete is altered.
    for (const [_, n] of Object.entries(data.nodes)) {
      if (n.name.startsWith("node")) {
        if (n.data.image.tags) delete n.data.image.tags;
        if (n.data.image.latest_sha) delete n.data.image.latest_sha;
      }
    }
    return data;
  }
};
