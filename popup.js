async function sha256(message) {
  const msgBuffer = new TextEncoder("utf-8").encode(message);

  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");

  return hashHex;
}

let isAuthenticated = false;

async function mainScreen(container) {
  container.innerHTML = "";

  const value = await chrome.storage.sync.get(["urls"]);

  const urls = value.urls ? JSON.parse(value.urls) : [];

  let ol = document.createElement("ol");
  ol.className = "list-group list-group-numbered w-100";
  ol.style.maxHeight = "250px";
  ol.style.overflow = "auto";

  urls.forEach((url) => {
    let li = document.createElement("li");
    li.className =
      "w-100 fw-bold list-group-item d-flex align-items-center gap-2";
    li.innerHTML = "<span class='flex-fill'>" + url.link + "</span>";

    let div = document.createElement("div");
    div.className = "d-flex align-items-center gap-2";

    let img = document.createElement("img");
    img.src = chrome.runtime.getURL("assets/trash-icon.png");
    img.style.width = "30px";
    img.style.height = "30px";
    img.style.zIndex = "9999";
    img.style.cursor = "pointer";

    img.onclick = () => {
      const newUrls = urls.filter((u) => u.link !== url.link);
      chrome.storage.sync.set({ urls: JSON.stringify(newUrls) }, () => {
        mainScreen(container);
      });
    };

    let img2 = document.createElement("img");
    img2.src = chrome.runtime.getURL(
      url.check ? "assets/lock-icon.png" : "assets/unlock-icon.png"
    );
    img2.style.width = "30px";
    img2.style.height = "30px";
    img2.style.cursor = "pointer";
    img2.onclick = () => {
      const newUrls = urls.map((u) => {
        if (u.link === url.link) return { ...u, check: !u.check };
        return u;
      });

      chrome.storage.sync.set({ urls: JSON.stringify(newUrls) }, () => {
        mainScreen(container);
      });
    };

    div.append(img, img2);

    li.appendChild(div);

    ol.appendChild(li);
  });

  // let h1 = document.createElement("h1");
  // h1.innerText = "Hello World";

  let button = document.createElement("button");
  button.innerText = "Add this webpage";
  button.className = "btn btn-success";
  button.style.cursor = "pointer";

  button.onclick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      let link = new URL(tabs[0].url).origin;

      const url = {
        link,
        check: true,
      };

      chrome.tabs.sendMessage(tabs[0].id, {
        name: "urls",
        url: link,
      });

      let _values = await chrome.storage.sync.get(["urls"]);
      let _urls = _values.urls ? JSON.parse(_values.urls) : [];
      _urls.push(url);

      const isUrlExist = _values.urls.includes(link);

      if (!isUrlExist) {
        let li = document.createElement("li");
        li.className =
          "w-100 fw-bold list-group-item d-flex align-items-center gap-2";
        li.innerHTML = "<span class='flex-fill'>" + url.link + "</span>";

        let div = document.createElement("div");
        div.className = "d-flex align-items-center gap-2";

        let img = document.createElement("img");
        img.src = chrome.runtime.getURL("assets/trash-icon.png");
        img.style.width = "30px";
        img.style.height = "30px";
        img.style.zIndex = "9999";
        img.style.cursor = "pointer";

        img.onclick = () => {
          const newUrls = _urls.filter((u) => u !== url.link);
          chrome.storage.sync.set({ urls: JSON.stringify(newUrls) }, () => {
            mainScreen(container);
          });
        };

        let img2 = document.createElement("img");
        img2.src = chrome.runtime.getURL(
          url.check ? "assets/lock-icon.png" : "assets/unlock-icon.png"
        );
        img2.style.width = "30px";
        img2.style.height = "30px";
        img2.style.cursor = "pointer";
        img2.onclick = () => {
          const newUrls = _urls.map((u) => {
            if (u.link === url.link) return { ...u, check: !u.check };
            return u;
          });

          console.log({ newUrls });

          chrome.storage.sync.set({ urls: JSON.stringify(newUrls) }, () => {
            mainScreen(container);
          });
        };

        div.append(img, img2);
        li.appendChild(div);
        ol.appendChild(li);
      }
    });
  };

  const trash = chrome.runtime.getURL("assets/trash-icon.png");
  const lock = chrome.runtime.getURL("assets/lock-icon.png");
  const unlock = chrome.runtime.getURL("assets/unlock-icon.png");

  let help_p = document.createElement("p");
  help_p.className = "p-0 m-0 d-none";
  help_p.innerHTML = `
    <section class="d-flex flex-column align-items-center gap-2">
      <div class="d-flex align-items-center gap-2">
        <img src="${trash}" style="width: 20px; height: 20px;" /> <span> -> Delete this url</span>
      </div>
      
      <div class="d-flex align-items-center gap-2">
        <img src="${lock}" style="width: 20px; height: 20px;" /> <span> -> Lock the webpage. Password protection</span>
      </div>

      <div class="d-flex align-items-center gap-2">
        <img src="${unlock}" style="width: 20px; height: 20px;" /> <span> -> Unlock the webpage. No password protection</span>
      </div>
    
    </section>
  `;

  let button2 = document.createElement("button");
  button2.innerText = "Help";
  button2.className = "btn btn-primary";
  button2.style.cursor = "pointer";
  button2.onclick = () => {
    if (help_p.classList.contains("d-none"))
      help_p.className = "p-0 m-0 d-block";
    else help_p.className = "p-0 m-0 d-none";
  };

  let div = document.createElement("div");
  div.className = "d-flex gap-5 align-items-center";
  div.append(button, button2);

  // extension-container

  container.append(ol, div, help_p);
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

async function authenticateScreen(container) {
  const input = document.createElement("input");
  input.type = "password";
  input.className = "form-control";
  input.placeholder = "Enter password";

  const button = document.createElement("button");
  button.className = "btn btn-primary";
  button.innerText = "Login";
  button.style.cursor = "pointer";
  button.onclick = async () => {
    const hash = await sha256(input.value);
    const value = await chrome.storage.sync.get(["password"]);
    if (value.password === hash) {
      isAuthenticated = true;
      mainScreen(container);
    } else {
      alert("Wrong password");
    }
  };

  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      button.click();
    }
  });

  const div = document.createElement("div");
  div.className = "w-100 d-flex gap-2 align-items-center";
  div.id = "login-div";
  div.append(input, button);

  container.appendChild(div);
}

document.addEventListener("DOMContentLoaded", async () => {
  const value = await chrome.storage.sync.get(["password"]);
  const password = value.password;

  let container = document.getElementById("extension-container");
  container.className =
    "container p-2 d-flex flex-column justify-content-between align-items-center gap-2";

  if (!password) {
    addPasswordScreen(container);
    return;
  }

  if (password && isAuthenticated) {
    mainScreen(container);
  } else authenticateScreen(container);
});
