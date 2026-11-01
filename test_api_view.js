const axios = require("axios");
const URL = "https://startschoolnextbe.onrender.comapi";
const subjectID = "692d32fe681568bad8602ce4";

async function testAPI() {
  try {
    console.log(`Hitting ${URL}/view-subject-exam/${subjectID}...`);
    const res = await axios.get(`${URL}/view-subject-exam/${subjectID}`);
    console.log("Response Status:", res.status);
    console.log("Response Body:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("API Error:", err.response ? err.response.data : err.message);
  }
}

testAPI();
