async function sha256(message) {
  const msgBuffer = new TextEncoder("utf-8").encode(message);

  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");

  return hashHex;
}
const div = document.createElement("div");
div.className = "entension_container";

(() => {
  const pageInnerHtml = document.body.innerHTML;

  chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
    if (obj.name === "block") {
      document.body.innerHTML = "";

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css";
      link.integrity =
        "sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65";
      link.crossOrigin = "anonymous";
      link.id = "bootstrap-css-chrome-extension-remove-1029384756";

      div.innerHTML = `
      <div class="w-100 modal fade show bg-black mw-100 mh-100" id="staticBackdropLive" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLiveLabel" style="display: block; --bs-bg-opacity: .60; backdrop-filter: blur(5px);" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5 text-dark" id="staticBackdropLiveLabel">This is an protected page.</h1>
            </div>
            <div class="modal-body">
            </div>
            <div class="modal-footer bg-white p-3">
            </div>
          </div>
        </div>
      </div>
      `;

      div.id = "bootstrap-css-chrome-extension-remove-1029384756";

      document.body.append(link, div);

      const modalBody = document.querySelector(".modal-body");
      const modalFooter = document.querySelector(".modal-footer");

      let input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter password";
      input.className = "w-100 form-control";
      input.name = "password-input-chrome-extension";
      input.autocomplete = "off";
      input.id = "password-input-chrome-extension";

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
          var remove_elements = document.querySelectorAll(
            "#bootstrap-css-chrome-extension-remove-1029384756"
          );

          remove_elements.forEach((element) => {
            element.remove();
          });

          return;
        }

        alert("Incorrect password");
      };

      modalBody.append(input);
      modalFooter.append(button);

      input.focus();
      return;
    }

    // document.body.innerHTML = pageInnerHtml;

    if (obj.name === "urls") {
      let preUrls = [];

      let value = await chrome.storage.sync.get(["urls"]);
      if (value.urls) preUrls = JSON.parse(value.urls);

      console.log({ preUrls });

      if (!preUrls.includes(obj.url)) {
        preUrls = [...preUrls, { link: obj.url, check: true }];

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
