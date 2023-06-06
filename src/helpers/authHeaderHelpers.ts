import crypto from "crypto";

/**
 * @param {string} method - HTTP method used for the request
 * @param {string} date - Request date/time in rfc1123-date format (eg Sun, 22 Apr 2012 08:49:37 GMT)
 * @param {string} path - Request path of the url
 * @param {string} body - Request body
 * @param {string} type - Request content type
 * @returns {string} - Hashed authentication header
 */
export const generateAuthHeader = (
  method: string,
  date: string,
  path: string,
  body: string,
  type: string
): string => {
  // 1. Create hexadecimal MD5 hash of request body
  const contentMD5 = crypto.createHash("md5").update(body).digest("hex");

  // 2. Create string for the signature data
  const unsignedData =
    method + "\n" + contentMD5 + "\n" + type + "\n" + date + "\n" + path;

  // 3. Create SHA1 hmac of signature data
  const signature = crypto
    .createHmac("sha1", process.env.REACT_APP_VUFORIA_CLIENT_SECRET_KEY)
    .update(unsignedData)
    .digest("base64");

  return signature;
};

/**
 * @param {any} form - Object containing the form data
 * @param {string} boundary - Request body boundary
 * @returns {string} - Formatted whole request body string
 */
export const generateWholeRequest = (form: any, boundary: string): string => {
  var body = "";
  for (var key in form) {
    const filename = form[key].filename
      ? '; filename="' + form[key].filename + '"'
      : "";
    const contentType = form[key].type
      ? "\r\nContent-type: " + form[key].type
      : "";

    body +=
      "--" +
      boundary +
      '\r\nContent-Disposition: form-data; name="' +
      form[key].name +
      '"' +
      filename +
      contentType +
      "\r\n\r\n" +
      form[key].value +
      "\r\n";
  }
  body += "--" + boundary + "--\r\n";

  return body;
};
