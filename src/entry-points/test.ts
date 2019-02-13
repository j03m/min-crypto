import * as tf from "@tensorflow/tfjs";
async function run (){
    await tf.loadModel('"file://./ai/training-feb-1-90d/model.json"');
}


//rerun train and save model, then load and test here
//step 2 - figure out accuracy, more data, read papers
run().then((model)=>{
    tf.tidy(() => {
        // Prepare input data as a 2D `tf.Tensor`.
        const inputData = [34.27459701,22.69323601,11.111875,-0.469486005,-12.05084701,0,0,0,0,0,0,0,0,0,0.167509318,-0.182107404,0.323686767];
        const input = tf.tensor2d([inputData]);
        const predictOut = model.predict(input);
        const logits = Array.from(predictOut.dataSync());
        console.log(logits);
    });
});
