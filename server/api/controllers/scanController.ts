import express from "express";
import multer from "multer";
import axios from "axios";
import { FormDataEncoder } from "form-data-encoder";

//const { FormDataEncoder } = await import("form-data-encoder");

import { FormData } from "formdata-node";
import { Readable } from "stream";

import createHash from "crypto-js/md5";
import hexEncode from "crypto-js/enc-hex";
import base64Encode from "crypto-js/enc-base64";
import createHmac from "crypto-js/hmac-sha1";
import crypto from "crypto";

import { ImageUploadJob } from "../jobs";
import { DatabaseService } from "../services";

const prisma = DatabaseService.instance;

export const uploadMiddleware = multer({ storage: multer.memoryStorage() });
export const fieldName = "image";

const TRUE = "true";
const FALSE = "false";

type NullString = "null";
type TrueString = typeof TRUE;
type FalseString = typeof FALSE;

interface NoFoundImageScan {
  token: string;
  scanSeqId: string;
  searchSuccess: FalseString;
  referenceImageUrl: NullString;
  esResponse: NullString;
  searchTime: NullString;
}

interface FoundImageScan {
  token: string;
  scanSeqId: string;
  searchSuccess: TrueString;
  referenceImageUrl: string;
  esResponse: string;
  searchTime: string;
}

interface TypedRequest extends express.Request {
  body: FoundImageScan | NoFoundImageScan;
}

class ScanController {
  public static async saveScan(
    request: TypedRequest,
    response: express.Response
  ) {
    const now = new Date(Date.now()).toISOString();
    const sessionId = request.sessionID;
    const queryImage = request.file.buffer.toString("base64");

    let referenceImageUrl =
      request.body.searchSuccess === TRUE
        ? request.body.referenceImageUrl
        : null;

    // We shouldn't be receiving a `referenceImageUrl` that is the string `null`
    if (referenceImageUrl === "null") {
      console.warn(`Reference Image URL is "null" string
	   Session ID: ${sessionId}
	   Search Success: ${request.body.searchSuccess} 
	  `);

      referenceImageUrl = null;
    }

    // Look up the album for this session and scan sequence
    let sessionAlbum = await prisma.albums.findFirst({
      where: {
        unique_identifier: request.body.scanSeqId,
        session_id: sessionId,
      },
    });

    // If none exists, we'll create it
    if (!sessionAlbum) {
      sessionAlbum = await prisma.albums.create({
        data: {
          session_id: sessionId,
          unique_identifier: request.body.scanSeqId,

          updated_at: now,
          created_at: now,
        },
      });
    }

    // We'll respond to the client that we've received their request
    // to store the image and close the connection with them
    response.status(200).json("Request to store image received");

    // We'll proceed with the image upload, no longer impacting the
    // client's connection as it should be ended by now
    await ImageUploadJob.main(parseInt(sessionAlbum.id.toString()), {
      imageBuffer: queryImage,
      searchTime: request.body.searchTime,
      referenceImageUrl,
    });
  }

  public static async searchScan(
    request: TypedRequest,
    response: express.Response
  ) {
    const queryImage = request.file;
    // @ts-ignore
    const imageBase64 = queryImage.buffer.toString("base64");
    const utf8Image = queryImage.buffer.toString("utf-8");

    const vuforiaURL = process.env.REACT_APP_VUFORIA_REQUEST_URL;
    const contentTypeBare = "multipart/form-data";

    const date = new Date().toUTCString();

    // // Set up the form data
    // const form = new FormData();
    // form.set("image", imageBase64);
    // form.set("include_target_data", "top");

    // // Encode the content and get the body
    // const encoder = new FormDataEncoder(form);
    // const readableStream = Readable.from(encoder.encode());
    // const chunks = [];
    // for await (const chunk of readableStream) {
    //   chunks.push(Buffer.from(chunk));
    // }
    // // const requestBody = Buffer.concat(chunks).toString("utf-8");
    // console.log("BODY ****************************************\n", requestBody);

    // Set the form data
    // const boundary = encoder.boundary;
    const boundary = Buffer.from(Math.random().toString(), "utf8")
      .toString("base64")
      .substring(0, 12);

    const formData = [
      {
        name: "image",
        value: utf8Image,
        type: "image/jpeg",
        filename: "temp_image.jpg",
      },
      {
        name: "include_target_data",
        value: "top",
      },
    ];

    const requestBody = generateWholeRequest(formData, boundary);

    const signature = generateSignature(
      "post",
      requestBody,
      contentTypeBare,
      date,
      "/v1/query"
    );

    const requestHeaders = {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      Accept: "application/json",
      Authorization: `VWS ${process.env.REACT_APP_VUFORIA_CLIENT_ACCESS_KEY}:${signature}`,
      Date: date,
    };

    try {
      const imageSearchResponse = await axios({
        method: "post",
        headers: requestHeaders,
        url: vuforiaURL,
        data: requestBody,
      });
    } catch (error) {
      console.log(`An error occurred sending request to Vueforia`, error);
    }

    // We'll respond to the client that we've received their request
    // to store the image and close the connection with them
    response.status(200).json("Request to store image received");
  }
}

/**
 * @param {string} requestMethod - HTTP method used for the request
 * @param {string} date - Request date/time in rfc1123-date format (eg Sun, 22 Apr 2012 08:49:37 GMT)
 * @param {string} requestPath - Request path of the url
 * @param {string} body - Request body
 * @param {string} contentType - Request content type
 * @returns {string} - Hashed authentication header
 */
export const generateSignature = (
  requestMethod: "post",
  requestBody: string,
  contentType: string,
  date: string,
  requestPath: string
): string => {
  // 1. Create hexadecimal MD5 hash of request body
  // const requestBodyMD5 = hexEncode.stringify(createHash(requestBody));
  console.log(requestBody);
  const requestBodyMD5 = crypto
    .createHash("md5")
    .update(requestBody)
    .digest("hex");

  // 2. Create string for the signature data
  const unsignedContent = `${requestMethod}\n ${requestBodyMD5}\n ${contentType}\n ${date}\n ${requestPath}\n`;

  // 3. Create SHA1 hmac of signature data
  // const signature = base64Encode.stringify(
  //   createHmac(unsignedContent, process.env.REACT_APP_VUFORIA_CLIENT_SECRET_KEY)
  // );
  const signature = crypto
    .createHmac("sha1", process.env.REACT_APP_VUFORIA_CLIENT_SECRET_KEY)
    .update(unsignedContent)
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

export default ScanController;
