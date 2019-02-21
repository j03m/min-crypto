const tf = require('@tensorflow/tfjs-node');
//const csvUrl = "file://./ai/training-feb-1-90d/boston-housing-train.csv";
const dir = "ai/training-feb1-180d";
const csvUrl = `file://./${dir}/data.csv`;
const modelUrl = `file://./${dir}/model`;

let model;
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
    model = tf.sequential();
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

run().then((history)=>{
    console.log(history);
    return model.save(modelUrl);
});