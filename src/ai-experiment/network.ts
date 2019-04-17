const mth = require("mathjs");

export interface ActivationFunction {
    (input:number):number
}

export function sigmoid(x:number):number {
   return 1 / (1 + Math.exp(-x))
}

export function randomClamped () {
    return Math.random() * 2 - 1;
}

export function feedForward(inputs:Array<number>, weights:Array<number>, activation:ActivationFunction){
    try{
        const total =  mth.multiply(inputs, weights);
        //todo replace with hashmap of activations functions
        return activation(total);
    }
    catch(ex){
        console.log(ex);
        throw ex;
    }
}

export function feedForwardNeuron(neuron:Neuron, inputs:Array<number>, activation:ActivationFunction){
    return feedForward(neuron.weights, inputs, activation);
}

export function feedForwardLayer(layer:Layer, inputs:Array<number>, activation:ActivationFunction){
        return layer.neurons.map((neuron) =>{
            return feedForwardNeuron(neuron, inputs, activation);
        });
}

export function feedForwardNetwork(network:Network, inputs:Array<number>, activeation:ActivationFunction){
    let currentInputs = inputs;
    return network.layers.map((layer)=>{
        currentInputs = feedForwardLayer(layer, currentInputs, activeation);
        return currentInputs;
    }).pop();
}

export class Neuron {
    private _weights:Array<number>;
    constructor(numberOfWeights:number){
        this._weights = [];
        for(let i = 0; i< numberOfWeights; i++){
            this._weights.push(randomClamped());
        }
    }
    public get weights() {
        return this._weights;
    }
}

export class Layer {
    private _index:number;
    private _neurons:Array<Neuron>;
    constructor(index:number, numNeurons:number, weights:number) {
        this._neurons = [];
        this._index = index;
        for (let i = 0; i < numNeurons; i++) {
            const neuron:Neuron = new Neuron(weights);
            this._neurons.push(neuron);
        }
    }
    get neurons(){
        return this._neurons;
    }
    get index(){
        return this._index;
    }
};

export interface LayerSpec {
    neurons: number,
    weightPerNeuron: number
}


export class Network {
    private _layers:Array<Layer>;
    constructor(layerSpecs:Array<LayerSpec>){
        this._layers = layerSpecs.reduce((layers:Array<Layer>, layerSpec:LayerSpec, index:number):Array<Layer> => {
            layers.push(new Layer(index, layerSpec.neurons, layerSpec.weightPerNeuron));
            return layers;
        }, []);
    }

    get layers(){
        return this._layers;
    }
}