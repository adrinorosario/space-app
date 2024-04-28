import express from "express";
import axios from "axios";
import morgan from "morgan";
import exp from "constants";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_KEY = "bNjULSboAPSvDaYME41SMmVjiPSiccn0oV9e1AiD";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended:true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/submit", async (req, res) => {
    console.log(req.body);
    const month = req.body.month;

    const d = new Date();
    let year = d.getFullYear();

    const start_date = `${year}-${month}-${req.body.startdate}`;
    const end_date = `${year}-${month}-${req.body.enddate}`;

    try {
        const response = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${API_KEY}`);
        //console.log(response.data[start_date]);
        const sd_asteroids = response.data.near_earth_objects[start_date];
        const ed_asteroids = response.data.near_earth_objects[end_date];

        const sd_asteroidData = sd_asteroids.map(asteroid => ({
            id: asteroid.id,
            name: asteroid.name,
            close_approach_date_full: asteroid.close_approach_data[0].close_approach_date_full,
            orbiting_body: asteroid.close_approach_data[0].orbiting_body
        }));

        const ed_asteroidData = ed_asteroids.map(asteroid => ({
            id: asteroid.id,
            name: asteroid.name,
            close_approach_date_full: asteroid.close_approach_data[0].close_approach_date_full,
            orbiting_body: asteroid.close_approach_data[0].orbiting_body
        }));

        //console.log(asteroidData[0]);
        res.render("index.ejs", { sd_data: ed_asteroidData[0], ed_data: ed_asteroidData[0]});
        
    } catch (error) {
        console.error("Failed to make request: ", error.message);
    }
});

app.get("/apod.ejs", async (req, res) => {
    try {
        var dtoday = new Date();
        var dd = String(dtoday.getDate()).padStart(2, '0');
        var mm = String(dtoday.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = dtoday.getFullYear();

        const today = yyyy + '/' + mm + '/' + dd;
        const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
        const result = (response.data);

        const data = {
            copyright: result.copyright,
            title: result.title,
            explanation: result.explanation,
            image: result.url
        };
        const url = result.url;
        console.log(url);

        res.render("apod.ejs", { data: data, image: url });
    } catch (error) {
        console.error("Failed to make request: ", error.message);
    }
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});