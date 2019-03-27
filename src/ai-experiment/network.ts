const mth = require("mathjs");


export function sigmoid(x:number):number {
   return 1 / (1 + Math.exp(-x))
}

export function randomClamped () {
    return Math.random() * 2 - 1;
}

export function feedForward(inputs:Array<number>, weights:Array<number>){
    try{
        const total =  mth.multiply(inputs, weights);
        return sigmoid(total);
    }
    catch(ex){
        console.log(ex);
        throw ex;
    }

}


export class Neuron {
    private weights:Array<number>;
    populate(numberOfWeights:number){
        this.weights = [];
        for(let i = 0; i< numberOfWeights; i++){
            this.weights.push(randomClamped());
        }
    }

    compute(inputs:Array<number>){
        return feedForward(inputs, this.weights);
    }
}

export class Layer {
    private index:number;
    private neurons:Array<Neuron>;
    constructor(index:number){
        this.index = index || 0;
    }

    populate(numNeurons:number, numInputs:number) {
        this.neurons = [];
        for (let i = 0; i < numNeurons; i++) {
            const neuron = new Neuron();
            neuron.populate(numInputs);
            this.neurons.push(neuron);
        }
    }

    compute(input:Array<number>):Array<number>{
        return this.neurons.map((neuron) => {
            return neuron.compute(input);
        });
    }
};

export default class Network {
    private layer:Layer; //todo implement as an array
    private output:Neuron;


    /**
     * Generate the initial network
     * todo: params should allow for arbitrary inputs and neurons
     */
    generate(){
        this.layer = new Layer(1);
        //2 inputs
        //2 hidden
        //1 output
        this.layer.populate(2, 2);
        this.output = new Neuron();
        this.output.populate(2);
    }


    /**
     * Train the network - training basically means adjusting weights to minimize loss
     */
    train(){

    }

    /**
     * Use the pre trained weights and biases to make a prediction
     */
    compute(input:Array<number>){
        return this.output.compute(this.layer.compute(input));
    }

}