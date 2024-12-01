const axios = require('axios');
require('dotenv').config();



async function files() {
  try {
    const url = "https://api.pinata.cloud/v3/files";

    const request = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      }
    });
    const response = await request.json();
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

files();