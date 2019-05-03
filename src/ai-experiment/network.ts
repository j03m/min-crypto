import {defaultCipherList} from "constants";

const mth = require("mathjs");
const assert = require("assert");



export interface TransformFunction {
    (input:number):number
}

export function sigmoid(x:number):number {
   return 1 / (1 + Math.exp(-x))
}

export function randomClamped () {
    return Math.random() * 2 - 1;
}

export class Neuron {
    private _weights:Array<number>;
    private _bias:number;
    private _activation:TransformFunction;
    private _score: number;
    private _output: number;
    constructor(numberOfWeights:number, bias:number, activation:TransformFunction){
        this._weights = [];
        this._bias = bias;
        for(let i = 0; i< numberOfWeights; i++){
            this._weights.push(randomClamped());
        }
        this._activation = activation;
    }
    public get weights() {
        return this._weights;
    }
    public get bias() {
        return this._bias;
    }

    static LearningRate = .02;

    feedForward(inputs:Array<number>): number{
        try{
            const total =  mth.multiply(inputs, this.weights) + this.bias;
            this._score = total;
            this._output = this._activation(total);
            return this._output;
        }
        catch(ex){
            console.log(ex);
            throw ex;
        }
    }
}

export class Layer {
    private _index:number;
    private _neurons:Array<Neuron>;
    private _activation:TransformFunction;
    private _derivative:TransformFunction;
    constructor(index:number, numNeurons:number, weights:number, bias:number, activation:TransformFunction) {
        this._neurons = [];
        this._index = index;
        this._activation = activation;
        for (let i = 0; i < numNeurons; i++) {
            const neuron:Neuron = new Neuron(weights, bias, this._activation);
            this._neurons.push(neuron);
        }
    }
    get neurons(){
        return this._neurons;
    }
    get index(){
        return this._index;
    }

    public feedForward(inputs:Array<number>){
        return this.neurons.map((neuron) =>{
            return neuron.feedForward(inputs);
        });
    }

};

export interface LayerSpec {
    neurons: number,
    weightPerNeuron: number
}


export class Network {
    private _layers:Array<Layer>;
    private _derivative:TransformFunction;
    private _activation:TransformFunction;
    constructor(layerSpecs:Array<LayerSpec>,
                activation:TransformFunction,
                derivative:TransformFunction){
        this._derivative = derivative;
        this._activation = activation;
        this._layers = layerSpecs.reduce((layers:Array<Layer>, layerSpec:LayerSpec, index:number):Array<Layer> => {
            layers.push(new Layer(index, layerSpec.neurons, layerSpec.weightPerNeuron, 0, this._activation));
            return layers;
        }, []);
    }

    public feedForward(inputs:Array<number>){
        let currentInputs = inputs;
        return this.layers.map((layer)=>{
            currentInputs = layer.feedForward(currentInputs);
            return currentInputs;
        }).pop();
    }

    get layers(){
        return this._layers;
    }

    /**
     * Todo: I think maybe you have this wrong, study the code not the article :/
     *
     * This is supposed to calculate the loss, but do you do that for each neuron or all of them in aggregate
     * and how do you then apply that loss in backprop? Refer to the python article?
     */
    public backpropagation(expectations:Array<number>){
        //we need an expection for each output
        assert(outputs.length === expectations.length, "Outputs must match expectations");

        //we get just the actual outputs
        const outputValues = outputs.map((neuronOutput:NeuronOutput) => {
            return neuronOutput.output;
        });

        const meanSquaredError = mth.mean(mth.square(mth.subtract(expectations, outputValues)));


        //for each neuron we need
        //the sum (raw)
        //the output (activation(raw)

        //we need the partial derivative of the final output vs the prediction d_L_d_ypred = -2 * (y_true - y_pred)

        //todo: Read the python, try to grok out what is happening so you can:
        //explain it in reference to gradients
        //implement it here


        //chain rule of a composed derivative is F'(x)=f'(g(x))g'(x). of F(x) = f(g(x))

        //Alice's gender is 1
        //our prediction is .5

        //mean squared loss for our prediction is Alice's (gender - our prediction)^2

        //if we had more then one prediction this would a matrix operation and we'd take the mean, above is just /1 because well 1 sample

        //The loss of our network is the aggregate value of all the values. We can think of it as one giant function

        //L(w1....wn, b1...bn)

        //if we want to try to make L small, by tweaking w1, how should we tweak w1 to make L smaller?

        //to know that we can use a partial derivative. Remenber a derivative is a rate of change at a given point

        //a partial derivative is the rate of change with respect to one piece of a multivariate equation ... (?)

        //These are needed to calculate a gradient with is the analog of a derivaitve for a multi dimensional surface

        //just like we can find the min/max of a curve using the derivative we can do this for a mds with gradients

        //important slide: single variable gradient descent https://medium.com/coinmonks/implementation-of-gradient-descent-in-python-a43f160ec521
        //port this to JS


        //on why we normalize
        /**
         * It is clear that the scale of each variable is very different from each other. If we run regression algorithm on it now, `size variable` will end up dominating the `bedroom variable`.

         To prevent this from happening we normalize the data. Which is to say we tone down the dominating variable and level the playing field a bit.

         my_data = (my_data - my_data.mean())/my_data.std()

         */

        //it seems to be this article implements gradient descent without derivatives https://medium.com/@tyreeostevenson/pokemon-stats-and-gradient-descent-for-multiple-variables-c9c077bbf9bd
        //it takes a pretty simple approach to minimizing loss

        //Derivatives I believe are needed because they tell you how to adjust your weights

        //just a gppd article: http://mccormickml.com/2014/03/04/gradient-descent-derivation/


    }

}