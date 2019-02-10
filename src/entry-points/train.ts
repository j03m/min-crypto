// //https://js.tensorflow.org/api/0.14.2/#data.csv
// import * as tf from "@tensorflow/tfjs";
// import {CSVDataset} from "@tensorflow/tfjs-data";
// const csvUrl = "file://./ai/training-feb-1-90d/data.csv";
// async function run() {
//     // We want to predict the column "medv", which represents a median value of
//     // a home (in $1000s), so we mark it as a label.
//     const csvDataset:CSVDataset = tf.data.csv(
//         csvUrl, {
//             columnConfigs: {
//                 action: {
//                     isLabel: true
//                 }
//             }
//         });
//
//     // Number of features is the number of column names minus one for the label
//     // column.
//     const numOfFeatures = (await csvDataset.columnNames()).length - 1;
//
//     // Prepare the Dataset for training.
//     const flattenedDataset =
//         csvDataset
//             .map(([rawFeatures, rawLabel]) =>
//                 // Convert rows from object form (keyed by column name) to array form.
//                 [Object.values(rawFeatures), Object.values(rawLabel)])
//             .batch(10);
//
//     // Define the model.
//     const model = tf.sequential();
//     model.add(tf.layers.dense({
//         inputShape: [numOfFeatures],
//         units: 10
//     }));
//     model.compile({
//         optimizer: tf.train.sgd(0.000001),
//         loss: 'meanSquaredError'
//     });
//
//     // Fit the model using the prepared Dataset
//     return model.fitDataset(flattenedDataset, {
//         epochs: 10,
//         callbacks: {
//             onEpochEnd: async (epoch, logs) => {
//                 console.log(epoch + ':' + logs.loss);
//             }
//         }
//     });
// }
//
// run().then((model)=>{
//     console.log("done!", model);
//     return model.save('file://../../ai/training-feb-1-90d/');
// });
//
// //strategy would: const model = await tf.loadModel('file:///tmp/my-model-1/model.json');

import * as tf from "@tensorflow/tfjs";
//const csvUrl = "file://./ai/training-feb-1-90d/boston-housing-train.csv";
const csvUrl = "file://./ai/training-feb-1-90d/data.csv";

async function run() {
    // We want to predict the column "medv", which represents a median value of
    // a home (in $1000s), so we mark it as a label.
    const csvDataset = tf.data.csv(
        csvUrl, {
            columnConfigs: {
                action: {
                    isLabel: true
                }
            },
            hasHeader:true
        });

    // Number of features is the number of column names minus one for the label
    // column.
    const numOfFeatures = (await csvDataset.columnNames()).length - 2;

    // Prepare the Dataset for training.
    const flattenedDataset =
        csvDataset
            .map(([rawFeatures, rawLabel]) => {
                // Convert rows from object form (keyed by column name) to array form.
                const trimDate = Object.values(rawFeatures);
                const final = trimDate.slice(1, trimDate.length);
                return [final, Object.values(rawLabel)]
            })
            .batch(10);

    // Define the model.
    const model = tf.sequential();
    model.add(tf.layers.dense({
        inputShape: [numOfFeatures],
        units: 1
    }));
    model.compile({
        optimizer: tf.train.sgd(0.000001),
        loss: 'meanSquaredError'
    });

    // Fit the model using the prepared Dataset
    return model.fitDataset(flattenedDataset, {
        epochs: 10,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                console.log(epoch + ':' + logs.loss);
            }
        }
    });
}

run().then((out)=>{
    console.log(out);
});