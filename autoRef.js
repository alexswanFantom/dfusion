import fs from "fs";
import { Document, Packer, Paragraph } from "docx";
import * as XLSX from "xlsx";
import axios from "axios";
import { ethers } from "ethers";
import FormData from "form-data";
import winston from "winston";
import dotenv from "dotenv";
import chalk from "chalk";
import readline from "readline";
import ora from "ora";
import cliProgress from "cli-progress";

dotenv.config();

console.log(
  chalk.cyan.bold(
    `   █████████   █████ ███████████   ██████████   ███████████      ███████    ███████████       █████████    █████████    █████████`
  )
);
console.log(
  chalk.cyan.bold(
    `  ███░░░░░███ ░░███ ░░███░░░░░███ ░░███░░░░███ ░░███░░░░░███   ███░░░░░███ ░░███░░░░░███     ███░░░░░███  ███░░░░░███  ███░░░░░███`
  )
);
console.log(
  chalk.cyan.bold(
    ` ░███    ░███  ░███  ░███    ░███  ░███   ░░███ ░███    ░███  ███     ░░███ ░███    ░███    ░███    ░███ ░███    ░░░  ███     ░░░`
  )
);
console.log(
  chalk.cyan.bold(
    ` ░███████████  ░███  ░██████████   ░███    ░███ ░██████████  ░███      ░███ ░██████████     ░███████████ ░░█████████ ░███         `
  )
);
console.log(
  chalk.cyan.bold(
    ` ░███░░░░░███  ░███  ░███░░░░░███  ░███    ░███ ░███░░░░░███ ░███      ░███ ░███░░░░░░      ░███░░░░░███  ░░░░░░░░███░███         `
  )
);
console.log(
  chalk.cyan.bold(
    ` ░███    ░███  ░███  ░███    ░███  ░███    ███  ░███    ░███ ░░███     ███  ░███            ░███    ░███  ███    ░███░░███     ███`
  )
);
console.log(
  chalk.cyan.bold(
    ` █████   █████ █████ █████   █████ ██████████   █████   █████ ░░░███████░   █████           █████   █████░░█████████  ░░█████████`
  )
);
console.log(
  chalk.cyan.bold(
    ` ░░░░░   ░░░░░ ░░░░░ ░░░░░   ░░░░░ ░░░░░░░░░░   ░░░░░   ░░░░░    ░░░░░░░    ░░░░░           ░░░░░   ░░░░░  ░░░░░░░░░    ░░░░░░░░░  `
  )
);
console.log(chalk.cyan.bold(`==============================================`));
console.log(chalk.cyan.bold(`    BOT              : AUTO REFF DFUSION `));
console.log(
  chalk.cyan.bold(`    Telegram Channel : @airdropasc              `)
);
console.log(
  chalk.cyan.bold(`    Telegram Group   : @autosultan_group        `)
);
console.log(chalk.cyan.bold(`==============================================`));

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askUserForRuns = () => {
  return new Promise((resolve) => {
    rl.question("Berapa jumlah ref yang ingin anda buat? ", (answer) => {
      const runs = parseInt(answer);
      if (isNaN(runs) || runs <= 0) {
        console.log("Silakan masukkan angka yang valid.");
        resolve(askUserForRuns());
      } else {
        resolve(runs);
      }
    });
  });
};

const API_URLS = {
  newsiwemessage: "https://dfusion.app.cryptolock.ai/auth/newsiwemessage",
  users: "https://dfusion.app.cryptolock.ai/auth/users",
  knowledgeSubmission:
    "https://dfusion.app.cryptolock.ai/api/knowledge/submissions/unknown",
};

const getRandomWord = () => {
  const words = ["melody", "harmony", "beat", "tune", "sound", "note"];
  return words[Math.floor(Math.random() * words.length)];
};

const generateRandomFilename = (extension) => {
  const randomName = getRandomWord();
  return `${randomName}_${Date.now()}.${extension}`;
};

const saveMnemonicToFile = (mnemonic) => {
  fs.appendFile("mnemonic.txt", `${mnemonic}\n`, "utf8", (error) => {
    if (error) {
      logger.error("Error saving mnemonic: " + error);
    } else {
      logger.info("Mnemonic saved to mnemonic.txt");
    }
  });
};

const sendToNewsiwemessage = async (address) => {
  try {
    const { data } = await axios.post(
      API_URLS.newsiwemessage,
      JSON.stringify(address),
      {
        headers: { accept: "*/*", "content-type": "application/json" },
      }
    );
    return data;
  } catch (error) {
    logger.error("Error posting data to newsiwemessage: " + error);
    return null;
  }
};

const createRandomFile = async () => {
  const randomChoice = Math.floor(Math.random() * 3);

  switch (randomChoice) {
    case 0:
      let filename = await createDocxFile();
      return filename;
    case 1:
      let filename1 = createXlsxFile();
      return filename1;
    case 2:
      let filename2 = createMp3File();
      return filename2;
  }
};

const uploadKnowledge = async (jwt) => {
  let filename = await createRandomFile();
  const randomFilePath = `./${filename}`;

  try {
    const formData = new FormData();
    formData.append("knowledge", fs.createReadStream(randomFilePath), {
      filename: filename,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const { data } = await axios.post(API_URLS.knowledgeSubmission, formData, {
      headers: {
        ...formData.getHeaders(),
        accept: "*/*",
        authorization: `Bearer ${jwt}`,
      },
    });
    logger.info("Knowledge submission success: " + data.message);
  } catch (error) {
    logger.error("Error uploading knowledge: " + error.message);
    if (error.response) {
      logger.error("Server response: " + error.response.data);
    }
  } finally {
    try {
      fs.unlinkSync(randomFilePath);
      logger.info(`File ${randomFilePath} deleted after upload.\n`);
    } catch (unlinkError) {
      logger.error("Error deleting file: " + unlinkError.message);
    }
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateRandomText = (wordCount) => {
  const words = [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
  ];
  let text = "";
  for (let i = 0; i < wordCount; i++) {
    text += words[Math.floor(Math.random() * words.length)] + " ";
  }
  return text.trim();
};

const createDocxFile = async () => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: generateRandomText(10),
            heading: "Heading1",
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = generateRandomFilename("docx");
  fs.writeFileSync(filename, buffer);
  return filename;
};

const createXlsxFile = () => {
  const data = Array.from({ length: 5 }, () => ({
    Name: generateRandomText(1),
    Value: Math.floor(Math.random() * 100),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const filename = generateRandomFilename("xlsx");
  XLSX.writeFile(workbook, filename);
  return filename;
};

const createMp3File = () => {
  const filename = generateRandomFilename("mp3");
  const randomData = Buffer.from(generateRandomText(10));
  fs.writeFileSync(filename, randomData);
  return filename;
};

const main = async () => {
  const numberOfRuns = await askUserForRuns();

  for (let i = 0; i < numberOfRuns; i++) {
    try {
      const wallet = ethers.Wallet.createRandom();
      const mnemonic = wallet.mnemonic.phrase;
      saveMnemonicToFile(mnemonic);

      const message = await sendToNewsiwemessage(wallet.address);
      if (!message) throw new Error("Failed to get SIWE message.");

      const { nonce, issuedAt, notBefore, expiration } =
        parseSiweMessage(message);
      if (!nonce || !issuedAt || !notBefore || !expiration) {
        throw new Error("Failed to parse message details.");
      }

      const signature = await wallet.signMessage(message);
      const data = createUserData(
        wallet.address,
        signature,
        nonce,
        issuedAt,
        expiration,
        notBefore
      );

      const userResponse = await axios.post(API_URLS.users, data, {
        headers: { accept: "*/*", "content-type": "application/json" },
      });
      logger.info("User registration success: " + userResponse.data.address);

      const jwt = userResponse.data.jwt;
      if (!jwt) throw new Error("Failed to retrieve JWT.");

      await uploadKnowledge(jwt);

      await sleep(2000);
    } catch (error) {
      handleError(error);
    }
  }
  logger.info(`successfully created ${numberOfRuns} reff`);
  rl.close();
};

const parseSiweMessage = (message) => {
  const nonceMatch = message.match(/Nonce:\s*([a-f0-9]+)/);
  const issuedAtMatch = message.match(/Issued At:\s+([\d\-T:.Z]+)/);
  const notBeforeMatch = message.match(/Not Before:\s+([\d\-T:.Z]+)/);
  const expirationMatch = message.match(/Expiration Time:\s+([\d\-T:.Z]+)/);

  return {
    nonce: nonceMatch ? nonceMatch[1] : null,
    issuedAt: issuedAtMatch ? issuedAtMatch[1] : null,
    notBefore: notBeforeMatch ? notBeforeMatch[1] : null,
    expiration: expirationMatch ? expirationMatch[1] : null,
  };
};

const createUserData = (
  address,
  signature,
  nonce,
  issuedAt,
  expiration,
  notBefore
) => {
  return {
    Email: "",
    ReferralCode: process.env.REF_CODE,
    Signature: signature,
    SiweEncodedMessage: `https://genesis.dfusion.ai wants you to sign in with your Ethereum account:\n${address}\n\nWelcome to the dFusion.AI Genesis Knowledge Contribution Event! Click to Sign In.\n\nURI: https://genesis.dfusion.ai\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}\nExpiration Time: ${expiration}\nNot Before: ${notBefore}`,
  };
};

const handleError = (error) => {
  if (error.response) {
    logger.error("Server error: " + error.response.data);
  } else if (error.request) {
    logger.error("No response received: " + error.request);
  } else {
    logger.error("Error: " + error.message);
  }
};

main();
