import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres1",
  host: "dpg-cv8lmhi3esus73dgdt5g-a.oregon-postgres.render.com",
  database: "booknotes_4ibu",
  password: "YjZGqXRvTySfSXjpiPVZDFYxxJ1JkbgJ",
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // This tells Node.js to bypass certificate validation. Use it for connecting to services like Render.
  },
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let search;
let sort = "id";

app.get("/", async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM books ORDER BY ${sort};`);
    const data = result.rows;
    res.render("index.ejs", { search: search, data: data });
  } catch (error) {
    console.log(error);
  }
});

app.get("/book", async (req, res) => {
  const { title, author, cover_id } = req.query;
  try {
    const result = await db.query("SELECT * FROM books");
    const data = result.rows;
    const bookCheck = data.find((book) => book.title === title);
    const review = bookCheck ? bookCheck.review : undefined;
    const book_id = bookCheck ? bookCheck.id : undefined;

    res.render("addbook.ejs", {
      title,
      author,
      cover_id,
      review,
      book_id,
    });
  } catch (error) {
    console.log(`Error : ${error.message}`);
  }
});

app.post("/addBook", async (req, res) => {
  const { title, author, cover_id, review, rating } = req.body;
  try {
    await db.query("INSERT INTO books(cover_id, title, author, review, rating) VALUES($1,$2,$3,$4,$5)", [
      cover_id,
      title,
      author,
      review,
      rating,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log(`Error : ${error.message}`);
  }
});

app.post("/updateReview", (req, res) => {
  const { review, rating, book_id } = req.body;
  const currentDate = new Date();
  try {
    db.query("UPDATE books SET review = $1, rating = $2, date = $3 WHERE id= $4", [
      review,
      rating,
      currentDate,
      book_id,
    ]);
    console.log(`book_id:${book_id}, rating:${rating}, currentDate:${currentDate}`);
    res.redirect("/");
  } catch (error) {
    console.log(`Error : ${error}`);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.id;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
  } catch (error) {
    console.log(`Delete error : ${error}`);
  }
  res.redirect("/");
});

app.post("/sort", async (req, res) => {
  sort = req.body.sort;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
