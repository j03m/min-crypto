const tf = require('@tensorflow/tfjs-node');
async function run (){
    return await tf.loadModel("file://./ai/training-feb-1-90d/model/model.json");
}
const BN = require("bignumber.js");

//rerun train and save model, then load and test here
//step 2 - figure out accuracy, more data, read papers
run().then((model)=>{
    tf.tidy(() => {
        // Prepare input data as a 2D `tf.Tensor`.

        //next steps:
        //add more non-none marks to the test set
        //test some buy/sell/nones to see what the output looks like, sell was a strong -0.1 maybe that indicates sell?
        //what does buy or none look like? Maybe we can classify differently? Strong sell, strong buy, okay sell, okay buy etc?

        //should be sell
        const lineReader = require("readline").createInterface({
            input: require("fs").createReadStream("/Users/jmordetsky/min-crypto/ai/testing-apr-1-90d/data.csv")
        });

        let count = 0;
        lineReader.on("line", (line)=>{
            if (count > 0){
                let parts = line.split(",");
                const expect = parts.pop(); //result pops off
                const date = parts.shift(); //shift off date

                parts = parts.map((value) => {
                    return new BN(value).toNumber();
                });

                const input = tf.tensor2d([parts]);
                const predictOut = model.predict(input);
                const logits = Array.from(predictOut.dataSync());
                console.log(`${date},${expect},${logits[0]}`);
            }
            count++;
        });

    });
});

