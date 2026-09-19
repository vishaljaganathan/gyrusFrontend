const axios = require('axios');

async function test() {
  try {
    // Attempting login to get token first if it fails with 401
    // Actually wait, let's just do a direct call and catch the error to see if it's 401
    const res = await axios.get("http://192.168.0.105:3000/api/chapters?className=XI&subject=Botany");
    console.log("Status:", res.status);
    console.log("Data length:", res.data.length);
    console.log("Data:", res.data);
  } catch (err) {
    console.log("Error status:", err.response?.status);
    console.log("Error data:", err.response?.data);
  }
}

test();
