const userForm = document.getElementById("user-form");

const LL_API_KEY = "3Y27S3X1xBWXB2oXk2Ppwm";
const LL_API_SECRET =
  "XxQ5w23gurcL9f4LFeoPUMPS7SCMSPIuPBxKTQHPvEgveg7UDuSXjMjhrb2D0dpE";
const LL_USERNAME = "juanluis9900";
let jwt = "";

userForm.addEventListener("submit", (event) => {
  let name = document.getElementById("nombre").value;
  let lastName = document.getElementById("apellido").value;
  let email = document.getElementById("correo").value;
  let phone = document.getElementById("numero").value;

  let payload = {
    customerData: {
      Nombre: name,
      Apellido: lastName,
      "Número telefónico": `58${phone}`,
      "Correo electrónico": email,
    },
    dataConsentOptIn: true,
  };

  event.preventDefault();

  // Generates the jwt token from an api key, secret &username

  jwt = generateJWT(LL_API_KEY, LL_API_SECRET, LL_USERNAME);

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

  //Check if the user is already registered
  callWebhook(
    "https://hook.eu1.make.com/rf6scir483gy5ls9vghehtpcmpoie16i",
    payload.customerData,
    "check"
  ).then((data) => {
    console.log(data);
  });
  //   TODO: HAY que agregar el cors en el header

  //   enrollUser(
  //     "https://api.loopyloyalty.com/v1/enrol/1hZWYt3Ojg04YT6mpioHQM",
  //     payload
  //   ).then((data) => {
  //     window.location.href = data.url;
  //   });
});

async function enrollUser(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
    body: JSON.stringify(data),
  });
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
