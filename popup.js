async function sha256(message) {
  const msgBuffer = new TextEncoder("utf-8").encode(message);

  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");

  return hashHex;
}

async function mainScreen(container) {
  const value = await chrome.storage.sync.get(["urls"]);

  const urls = value.urls ? JSON.parse(value.urls) : [];

  container.innerHTML = "";
  container.className =
    "container p-2 d-flex flex-column justify-content-between align-items-center gap-2";

  let ol = document.createElement("ol");
  ol.className = "list-group list-group-numbered w-100";
  ol.style.maxHeight = "250px";
  ol.style.overflow = "auto";

  urls.forEach((url) => {
    let li = document.createElement("li");
    li.className =
      "w-100 fw-bold list-group-item d-flex align-items-center gap-2";
    li.innerHTML = "<span class='flex-fill'>" + url + "</span>";

    let img = document.createElement("img");
    img.src = chrome.runtime.getURL("assets/trash-icon.png");
    img.style.width = "20px";
    img.style.height = "20px";
    img.style.cursor = "pointer";
    img.onclick = () => {
      const newUrls = urls.filter((u) => u !== url);
      chrome.storage.sync.set({ urls: JSON.stringify(newUrls) }, () => {
        mainScreen(container);
      });
    };

    li.appendChild(img);

    ol.appendChild(li);
  });

  // let h1 = document.createElement("h1");
  // h1.innerText = "Hello World";

  let button = document.createElement("button");
  button.innerText = "Add this webpage";
  button.className = "btn btn-success";
  button.style.cursor = "pointer";

  let isAdded = false;

  button.onclick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      let url = new URL(tabs[0].url).origin;

      chrome.tabs.sendMessage(tabs[0].id, {
        name: "urls",
        url,
      });

      let _values = await chrome.storage.sync.get(["urls"]);

      const isUrlExist = _values.urls.includes(url);

      if (!isUrlExist && !isAdded) {
        let li = document.createElement("li");
        li.className =
          "w-100 fw-bold list-group-item d-flex align-items-center gap-2";
        li.innerHTML = "<span class='flex-fill'>" + url + "</span>";

        let img = document.createElement("img");
        img.src = chrome.runtime.getURL("assets/trash-icon.png");
        img.style.width = "20px";
        img.style.height = "20px";
        img.style.cursor = "pointer";
        img.onclick = () => {
          const newUrls = urls.filter((u) => u !== url);
          chrome.storage.sync.set({ urls: JSON.stringify(newUrls) }, () => {
            mainScreen(container);
          });
        };

        li.appendChild(img);
        ol.appendChild(li);

        isAdded = true;
      }
    });
  };

  container.append(ol, button);
}

function addPasswordScreen(container) {
  let input1 = document.createElement("input");
  input1.type = "password";
  input1.placeholder = "Enter Password";
  container.appendChild(input1);

  let input2 = document.createElement("input");
  input2.type = "password";
  input2.placeholder = "Confirm your Password";
  container.appendChild(input2);

  let button = document.createElement("button");
  button.innerText = "Add password";

  button.onclick = async () => {
    const input1Value = input1.value;
    const input2Value = input2.value;

    if (input1Value !== input2Value) {
      alert("Password doesn't match");
      input1.value = "";
      input2.value = "";
      return;
    }

    const password = await sha256(input1.value);

    chrome.storage.sync.set({ password }, () => {});
    mainScreen(container);
  };

  container.appendChild(button);
}

document.addEventListener("DOMContentLoaded", async () => {
  const value = await chrome.storage.sync.get(["password"]);
  const password = value.password;

  let container = document.getElementById("extension-container");

  if (password) {
    mainScreen(container);
  } else {
    addPasswordScreen(container);
  }
});
