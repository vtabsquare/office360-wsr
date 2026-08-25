import { fetchLiveWsrData } from './src/services/backendWsrService.ts';

async function run() {
  try {
    const data = await fetchLiveWsrData();
    console.log("Success! Fetched", data.length, "teams");
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

run();
