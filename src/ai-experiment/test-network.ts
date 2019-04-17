import {Network, feedForwardNetwork, sigmoid} from "./network";

const network = new Network([
    { neurons: 2, weightPerNeuron: 2},
    { neurons: 1, weightPerNeuron: 2}
]);

console.log("I think: ", feedForwardNetwork(network, [-2, -1], sigmoid))


