async function sha256(message) {
  const msgBuffer = new TextEncoder("utf-8").encode(message);

  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");

  return hashHex;
}

(() => {
  chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
    if (obj.name === "block") {
      const pageInnerHtml = document.body.innerHTML;

      document.body.innerHTML = "";

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css";
      link.integrity =
        "sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65";
      link.crossOrigin = "anonymous";

      const div = document.createElement("div");
      div.className = "entension_container";

      div.innerHTML = `
      <div class="modal fade show" id="staticBackdropLive" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLiveLabel" style="display: block;" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5 text-dark" id="staticBackdropLiveLabel">This is an protected page.</h1>
            </div>
            <div class="modal-body">
            </div>
            <div class="modal-footer">
            </div>
          </div>
        </div>
      </div>
      `;

      document.body.append(link, div);

      const modalBody = document.querySelector(".modal-body");
      const modalFooter = document.querySelector(".modal-footer");

      let input = document.createElement("input");
      input.type = "password";
      input.placeholder = "Enter password";
      input.className = "w-100 form-control";
      input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          button.click();
        }
      });

      let button = document.createElement("button");
      button.innerText = "Submit";
      button.className = "btn btn-primary";

      button.onclick = async () => {
        const password = await sha256(input.value);
        const value = await chrome.storage.sync.get(["password"]);

        const isPasswordCorrect = password === value.password;

        console.log({ isPasswordCorrect });

        if (isPasswordCorrect) {
          document.body.innerHTML = pageInnerHtml;
          return;
        }

        alert("Incorrect password");
      };

      modalBody.append(input);
      modalFooter.append(button);
      return;
    }

    // document.body.innerHTML = pageInnerHtml;

    if (obj.name === "urls") {
      let preUrls = [];

      let value = await chrome.storage.sync.get(["urls"]);
      if (value.urls) preUrls = JSON.parse(value.urls);

      console.log({ preUrls });

      if (!preUrls.includes(obj.url)) {
        preUrls = [...preUrls, obj.url];

        chrome.storage.sync.set(
          { urls: JSON.stringify(preUrls) },
          (newValue) => {
            console.log({ newValue });
          }
        );
      }

      response({ urls: preUrls });
    }
  });
})();
