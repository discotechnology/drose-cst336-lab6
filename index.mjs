import express from 'express';
import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "blonze2d5mrbmcgf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "v4e3w6yhr383ikbh",
    password: "t18coasub4oc9hn8",
    database: "s7jmctxlgmkxgwx2",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
   res.render('index');
});

app.get('/author/new', async(req, res) => {
    let response = await fetch("https://restcountries.com/v3.1/independent?status=true");
    let data = await response.json();
    let countries = [];
    for(let i in data) {
        countries[i] = data[i].name.common;
    }
    countries.sort();
    res.render('newAuthor',{countries: countries});
});

app.post("/author/new", async function(req, res){
    let fName = req.body.fName;
    let lName = req.body.lName;
    let birthDate = req.body.birthDate;
    let deathDate = req.body.deathDate;
    let sex = req.body.sex;
    let country = req.body.country;
    let profession = req.body.profession;
    let biography = req.body.biography;
    let portrait = req.body.portrait;
    let sql = `INSERT INTO q_authors
                (firstName, lastName, dob, dod, sex, country, profession, biography, portrait)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let params = [fName, lName, birthDate, deathDate, sex, country, profession, biography, portrait];
    const [rows] = await pool.query(sql, params);

    let response = await fetch("https://restcountries.com/v3.1/independent?status=true");
    let data = await response.json();
    let countries = [];
    for(let i in data) {
        countries[i] = data[i].name.common;
    }
    countries.sort();

    res.render("newAuthor", 
                {"message": "Author added!", countries: countries});
});

app.get("/authors", async function(req, res){
    let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    const [rows] = await pool.query(sql);
    res.render("authorList", {"authors":rows});
});

app.get("/author/delete", async function(req, res){
    let sql = `DELETE FROM q_authors
            WHERE authorId = ?`;
    let params = [req.query.authorId];
    const [rows] = await pool.query(sql, params);
    res.redirect("/authors");
});



app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query(
            "SELECT * FROM q_authors");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})