import express from "express";
import path from "path";
import sqlite3 from "sqlite3";

type Line = {
  id: string;
  fullLink: string;
  clicks: number;
};

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(path.resolve(__dirname, "./db/database.db"));

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS links ( id TEXT PRIMARY KEY, fullLink TEXT, clicks INTEGER DEFAULT 0);"
  );
});

function shortid(size = 6) {
  const chars = [
    [48, 57],
    [66, 90],
    [97, 122],
  ];
  const rnd = (min: number, max: number) =>
    min + Math.floor(Math.random() * (max + 1 - min));
  let id = "";
  while (id.length < size) {
    const [rangeMin, rangeMax] = chars[rnd(0, chars.length - 1)];
    id += String.fromCharCode(rnd(rangeMin, rangeMax));
  }
  return id;
}

const app = express();

app.use(express.static("static"));

app.get("/", function (req, res) {
  res.sendFile(path.resolve(__dirname, "./index.html"));
});

app.get("/add/:url", function (req, res) {
  const url = req.params.url;
  const insertStmt = db.prepare(
    "INSERT INTO links (fullLink, id, clicks) VALUES (?, ?, ?)"
  );
  insertStmt.run(url, shortid(), 0, (err: any) => {
    if (err) {
      res.status(505);
      res.send(err);
      return;
    }
    res.json({ status: "OK" });
  });
});

app.get("/short/:id", function (req, res) {
  const id = req.params.id;
  db.get<Line>("SELECT * FROM links WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.send(err.message);
      return;
    }
    if (!row) {
      res.sendStatus(404);
      return;
    }
    db.run("UPDATE links SET clicks = ? WHERE id = ?", [row.clicks + 1, id]);
    res.redirect(row.fullLink);
  });
});

app.get("/getAll", function (req, res) {
  db.all<Line[]>("SELECT * FROM links", (err, rows) => {
    if (err) {
      res.send(err.message);
      return;
    }
    if (!rows) {
      res.sendStatus(404);
      return;
    }
    res.json(rows);
  });
});

app.get("/get/:page", function (req, res) {
  const page = parseInt(req.params.page, 10);
  db.all<Line[]>(
    "SELECT * FROM links LIMIT 10 OFFSET ?",
    [page * 10],
    (err, rows) => {
      if (err) {
        res.send(err.message);
        return;
      }
      if (!rows) {
        res.sendStatus(404);
        return;
      }
      res.json(rows);
    }
  );
});

const port = parseInt(process.env.PORT, 10) || 5000;
app.listen(port, function () {
  console.log(`App listening on http://localhost:${port}`);
});
