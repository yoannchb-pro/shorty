const table = document.querySelector("table");
const input = document.querySelector("input");
const btn = document.querySelector("button");
const info = document.querySelector("#info");

function getShortedLink(id) {
  return document.location.href + "short/" + id;
}

function displayLink(link) {
  info.style.color = "var(--color)";
  info.style.display = "block";
  info.textContent = link + "\n(Copied to clipboard)";
}

function displayError(err) {
  info.style.color = "var(--error)";
  info.style.display = "block";
  info.textContent = err || "Une erreur est survenue";
}

function addLine(dataRow) {
  const row = document.createElement("tr");

  //short
  const short = document.createElement("td");
  const link = document.createElement("a");
  const shortedLink = getShortedLink(dataRow.id);
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

async function displayTable() {
  try {
    const req = await fetch("/getAll");
    const data = await req.json();
    for (let i = 1; i < table.children.length; ++i) {
      table.children[i].remove();
    }
    for (const dataRow of data) {
      addLine(dataRow);
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
      const link = getShortedLink(rep.data.id);
      navigator.clipboard.writeText(link);
      displayLink(link);
      addLine(rep.data);
    }
  } catch (e) {
    displayError(e);
  }
});

displayTable();
