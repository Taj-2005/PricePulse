import { TrackedProduct } from "@/models/trackedProduct";

async function batches(){
const totalProducts = await TrackedProduct.countDocuments();
const batchSize = 5;
const totalBatches = Math.ceil(totalProducts / batchSize);
console.log(`You need to create ${totalBatches} cron jobs on cron-jobs.org.`);
}
