const userForm = document.getElementById("user-form");

const LL_API_KEY = "3Y27S3X1xBWXB2oXk2Ppwm";
const LL_API_SECRET =
  "XxQ5w23gurcL9f4LFeoPUMPS7SCMSPIuPBxKTQHPvEgveg7UDuSXjMjhrb2D0dpE";
const LL_USERNAME = "juanluis9900";
const TERMS_URL =
  "https://api.loopyloyalty.com/v1/campaign/id/1hZWYt3Ojg04YT6mpioHQM";
let jwt = "";

const termsContainer = document.getElementById("terms-container");
const priceContainer = document.getElementById("price-container");
const registeredContainer = document.getElementById("registered-container");

async function enrollUser(url = "", data = {}, key) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: key,
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    return e;
  }

  return response.json();
}

async function callWebhook(url = "", data = {}, petition) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      // Add CORS headers to allow requests from any origin
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({ userData: data, petition: petition }),
  });
  return response.json();
}

async function addUser(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      // Add CORS headers to allow requests from any origin
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

const retrieveTerms = async () => {
  jwt = generateJWT(LL_API_KEY, LL_API_SECRET, LL_USERNAME);

  const response = await fetch(TERMS_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  });
  return await response.json();
};

document.addEventListener("DOMContentLoaded", async function () {
  validateForm();
  const phoneInputField = document.querySelector("#numero");
  const phoneInput = window.intlTelInput(phoneInputField, {
    initialCountry: "ve",
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  const resp = await retrieveTerms();
  const { terms, description } = resp;
  console.log(resp);

  priceContainer.innerHTML = description;

  const termsArray = terms.split("\n");

  // Create an HTML structure to display each term in a separate paragraph
  const termsHTML = termsArray.map((term) => `<p>${term.trim()}</p>`).join("");

  // Display the terms in the terms container
  termsContainer.innerHTML = termsHTML;

  userForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const valid = validateForm();
    console.log(valid);
    if (!valid) return;
    let name = document.getElementById("nombre").value;
    let lastName = document.getElementById("apellido").value;
    let email = document.getElementById("correo").value;
    let phone = phoneInput.getNumber();

    let payload = {
      customerData: {
        Nombre: name,
        Apellido: lastName,
        "Número telefónico": phone,
        "Correo electrónico": email,
      },
      dataConsentOptIn: true,
    };

    // Generates the jwt token from an api key, secret &username

    jwt = generateJWT(LL_API_KEY, LL_API_SECRET, LL_USERNAME);

    console.log(payload);
    //Check if the user is already registered
    callWebhook(
      "https://hook.eu1.make.com/rf6scir483gy5ls9vghehtpcmpoie16i",
      payload,
      "check"
    ).then((data) => {
      console.log(data);
      const { isRegistered } = data;
      console.log(isRegistered);
      if (isRegistered) {
        registeredContainer.innerText =
          "Ya te encuentras registrado, verifica tu correo si necesitas recuperar tu tarjeta.";
      } else {
        console.log("im here");

        enrollUser(
          "https://api.loopyloyalty.com/v1/enrol/1hZWYt3Ojg04YT6mpioHQM",
          payload,
          jwt
        ).then((data) => {
          console.log(data);
          const { pid, url: cardLink } = data;
          console.log({ pid, cardLink });
          const hookPayload = { ...payload, pid, cardLink };
          addUser(
            "https://hook.eu1.make.com/xzrpqy7bgmv7v76cnkxm116yu1dzqi7h",
            hookPayload
          ).then((data) => {
            console.log(data);
            // const { ok, url } = data;
            if (!data.ok) {
              registeredContainer.innerText =
                "Ocurrió un error, verifica los datos e intentalo de nuevo";
              return;
            }
            window.location.href = data.url;
          });
        });
      }
    });
  });
});

function generateJWT(key, secret, username) {
  var body = {
    uid: key,
    exp: Math.floor(new Date().getTime() / 1000) + 3600,
    iat: Math.floor(new Date().getTime() / 1000) - 10,
    username: username,
  };

  header = {
    alg: "HS256",
    typ: "JWT",
  };
  var token = [];
  token[0] = base64url(JSON.stringify(header));
  token[1] = base64url(JSON.stringify(body));
  token[2] = genTokenSign(token, secret);

  return token.join(".");
}

function genTokenSign(token, secret) {
  if (token.length != 2) {
    return;
  }
  var hash = CryptoJS.HmacSHA256(token.join("."), secret);
  var base64Hash = CryptoJS.enc.Base64.stringify(hash);
  return urlConvertBase64(base64Hash);
}

function base64url(input) {
  var base64String = btoa(input);
  return urlConvertBase64(base64String);
}

function urlConvertBase64(input) {
  var output = input.replace(/=+$/, "");
  output = output.replace(/\+/g, "-");
  output = output.replace(/\//g, "_");

  return output;
}

function validateForm() {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        let allInputsValid = true; // Initialize the flag as true
        const inputs = form.querySelectorAll(".form-control"); // Assuming "form-control" is the class for your input elements
        inputs.forEach((input) => {
          if (
            !input.checkValidity() &&
            !input.hasAttribute("data-validation-ignore")
          ) {
            allInputsValid = false; // Set the flag to false if at least one input is invalid
          }
        });

        form.classList.add("was-validated");

        if (!allInputsValid) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      },
      false
    );
  });
  return true;
}
