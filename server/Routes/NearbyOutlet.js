const express = require('express')
const bodyParser = require('body-parser')
const { findNearbyOutlets } = require('../Controller/NearbyOutlet')

const NearbyRouter = express.Router()

const jsonparser = bodyParser.json()
NearbyRouter.post("/findNearestOutlets",findNearbyOutlets)

module.exports = NearbyRouter