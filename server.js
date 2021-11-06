require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//Connect mongo atlas
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
console.log("if mongoose is connected: ", mongoose.connect.readyState);

const urlSchema = new mongoose.Schema({
	shorturl: Number,
	url: String,
});

let Url = mongoose.model("Url", urlSchema);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//link validation regex
const protocol_regex = /^\D{3,5}:\/\//;

//link validation middleware

const validate_url = (req, res, next) => {
	console.log("------request------------------");
	console.log(req.body.url);
	console.log("------validate------------------");
	console.log("protocol: " + protocol_regex.test(req.body.url));
	console.log("------validate------------------");
	if (protocol_regex.test(req.body.url)) {
		console.log("probs a url");
	} else {
		return res.status(400).json({
			error: "invalid url",
		});
	}
	next();
};

app.use("/api/shorturl", validate_url);

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint

app.post("/api/shorturl", (req, res) => {
	let newUrl = new Url({ shorturl: 1000, url: req.body.url });
	newUrl.save();
	const original_url = req.body.url;
	const short_url = 1000;
	res.json({ original_url, short_url });
});

app.get("/api/shorturl/:id", function (req, res) {
	if (req.params.id === "1") {
		res.redirect("https://www.google.com");
	} else {
		res.send("hello");
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
