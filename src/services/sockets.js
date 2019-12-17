import Rete from "rete";
import Types from "src/services/types";

let sockets = {};

class CustomSocket extends Rete.Socket {
  constructor(name, isDataSocket) {
    super(name);
    this.isDataSocket = isDataSocket || false;
  }
  compatibleWith(otherSocket) {
    if (this.isDataSocket && otherSocket.isDataSocket) {
      return false;
    }
    if (this.isDataSocket || otherSocket.isDataSocket) {
      return true;
    }

    let str1 = this.name,
      str2 = otherSocket.name;

    return Types.areCompatible(str1, str2);
  }
}

export default {
  addInput(num, name, toNode) {
    sockets[name] = sockets[name] || new CustomSocket(name);
    toNode.addInput(new Rete.Input("i/" + num, name, sockets[name]));
  },
  addOutput(num, name, toNode) {
    sockets[name] = sockets[name] || new CustomSocket(name);
    toNode.addOutput(new Rete.Output("o/" + num, name, sockets[name]));
  },
  CustomSocket,
  input: new CustomSocket("input", true),
  output: new CustomSocket("output", true)
};
