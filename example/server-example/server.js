const { MolassesClient } = require("@molassesapp/molasses-server")
const APIKey = process.env.MOLASSES_API_KEY

const client = new MolassesClient({
  APIKey,
})

async function a() {
  try {
    await client.init()
  } catch (e) {
    console.error(e)
  }
}

a()
var express = require("express")
var app = express()

// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  const result = client.isActive("TEST_FEATURE_FOR_USER", {
    id: "123",
    params: {
      isBetaUser: "true",
    },
  })
  res.send(`hello world ${result}`)
})
app.listen(3001, () => console.log(`Example app listening at http://localhost:${3001}`))
