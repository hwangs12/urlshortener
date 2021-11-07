require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//Connect mongo atlas
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

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

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/shorturl/:lemon", (req, res) => {
	try {
		console.log(req.params.lemon);
		Url.findOne({ shorturl: parseInt(req.params.lemon) }, (err, data) => {
			if (err) return console.log(err);
			const lemon = JSON.stringify(data["url"]);
			const lemonpie = JSON.parse(lemon);
			res.redirect(lemonpie);
		});
	} catch (err) {
		console.log(err);
	}
	// res.json(req.params.lemon);
});

app.post("/api/shorturl", validate_url, (req, res) => {
	// let newUrl = new Url({ shorturl: 1000, url: req.body.url });
	Url.findOne({ url: req.body.url }, (err, data) => {
		//if shorturl already exists, show that on browser
		if (err) return console.log(err);
		if (data) {
			const { url, shorturl } = data;
			res.json({ original_url: url, short_url: shorturl });
		} else {
			Url.findOne()
				.sort("-shorturl")
				.exec(function (err, member) {
					if (err) return console.log(err);
					const newShort = member.shorturl + 1;
					let newUrl = new Url({
						shorturl: newShort,
						url: req.body.url,
					});
					newUrl.save();
					res.json({
						original_url: req.body.url,
						short_url: newShort,
					});
				});
		}
		//if it doesn't, find last index and show the new index (last index+1)
		//that on browser
	});

	// newUrl.save();
	// const original_url = req.body.url;
	// const short_url = 1000;
	// res.json({ original_url, short_url });
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
