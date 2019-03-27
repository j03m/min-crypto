import Network from "./network";

const network = new Network();
network.generate();
console.log("I think: ", network.compute([-2,-1]));