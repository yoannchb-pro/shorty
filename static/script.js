const table = document.querySelector("table");
const input = document.querySelector("input");
const btn = document.querySelector("button");
const error = document.querySelector("#error");

function displayError(err) {
  error.style.display = "block";
  error.textContent = err || "Une erreur est survenue";
}

async function displayTable() {
  try {
    const req = await fetch("/getAll");
    const data = await req.json();
    console.log(data);
    for (const dataRow of data) {
      const row = document.createElement("tr");

      //short
      const short = document.createElement("td");
      const link = document.createElement("a");
      const shortedLink = document.location.href + "short/" + dataRow.id;
      link.href = shortedLink;
      link.target = "_blank";
      link.textContent = shortedLink;
      short.appendChild(link);

      //Full link
      const full = document.createElement("td");
      const fullLink = document.createElement("a");
      fullLink.href = dataRow.fullLink;
      fullLink.target = "_blank";
      fullLink.textContent = dataRow.fullLink;
      full.appendChild(fullLink);

      //clicks
      const clicks = document.createElement("td");
      clicks.textContent = dataRow.clicks;

      row.appendChild(short);
      row.appendChild(full);
      row.appendChild(clicks);

      table.appendChild(row);
    }
  } catch (e) {
    displayError(e);
  }
}

btn.addEventListener("click", async function () {
  try {
    const url = input.value;

    if (
      url.trim() === "" ||
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6}).+/.test(url)
    ) {
      throw new Error("Invalid URL");
    }

    const req = await fetch("/add/" + encodeURIComponent(url));
    const rep = await req.json();
    if (rep.status === "OK") {
      document.location.reload();
    }
  } catch (e) {
    displayError(e);
  }
});

displayTable();
