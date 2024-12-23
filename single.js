import fs from "fs";
import { Document, Packer, Paragraph } from "docx";
import * as XLSX from "xlsx";
import axios from "axios";
import { ethers } from "ethers";
import FormData from "form-data";
import winston from "winston";
import dotenv from "dotenv";
import readline from "readline"; // Import readline
import ora from "ora"; // Import spinner
import cliProgress from "cli-progress"; // Import progress bar

import chalk from "chalk";

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
console.log(chalk.cyan.bold(`    BOT              : SINGLE UPLOAD DFUSION `));
console.log(
  chalk.cyan.bold(`    Telegram Channel : @airdropasc              `)
);
console.log(
  chalk.cyan.bold(`    Telegram Group   : @autosultan_group        `)
);
console.log(chalk.cyan.bold(`==============================================`));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask user how many times to run the bot
const askUserForRuns = () => {
  return new Promise((resolve) => {
    rl.question("Berapa jumlah file yang ingin anda upload? ", (answer) => {
      const runs = parseInt(answer);
      if (isNaN(runs) || runs <= 0) {
        console.log("Silakan masukkan angka yang valid.");
        resolve(askUserForRuns()); // Ask again if input is invalid
      } else {
        resolve(runs);
      }
    });
  });
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log ke konsol
    new winston.transports.File({ filename: "app.log" }), // Log ke file
  ],
});

const API_URLS = {
  newsiwemessage: "https://dfusion.app.cryptolock.ai/auth/newsiwemessage",
  users: "https://dfusion.app.cryptolock.ai/auth/users",
  knowledgeSubmission:
    "https://dfusion.app.cryptolock.ai/api/knowledge/submissions/unknown",
  authenticateUser: "https://dfusion.app.cryptolock.ai/auth/authenticate",
};

// Function to create a loading spinner
const createSpinner = (text) => {
  const spinner = ora(text).start();
  return spinner;
};

// Function to create a progress bar
const createProgressBar = (total) => {
  const progressBar = new cliProgress.SingleBar({
    format: "Uploading | {bar} | {percentage}% | {value}/{total} Files",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
  progressBar.start(total, 0);
  return progressBar;
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

  const spinner = createSpinner(`Uploading ${filename}...`);

  try {
    const formData = new FormData();
    formData.append("knowledge", fs.createReadStream(randomFilePath), {
      filename: filename,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const progressBar = createProgressBar(1);
    const { data } = await axios.post(API_URLS.knowledgeSubmission, formData, {
      headers: {
        ...formData.getHeaders(),
        accept: "*/*",
        authorization: `Bearer ${jwt}`,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        progressBar.update(percentCompleted);
      },
    });

    progressBar.stop();

    spinner.succeed(`Knowledge submission success: ${data.message}`);
    await sleep(3000);
    spinner.stop();
  } catch (error) {
    spinner.fail("Error uploading knowledge: " + error.message);
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
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const message = await sendToNewsiwemessage(wallet.address);
  if (!message) throw new Error("Failed to get SIWE message.");

  const { nonce, issuedAt, notBefore, expiration } = parseSiweMessage(message);
  if (!nonce || !issuedAt || !notBefore || !expiration) {
    throw new Error("Failed to parse message details.");
  }

  const signature = await wallet.signMessage(message);
  const data = authenticatedUser(
    wallet.address,
    signature,
    nonce,
    issuedAt,
    expiration,
    notBefore
  );

  const userResponse = await axios.post(API_URLS.authenticateUser, data, {
    headers: { accept: "*/*", "content-type": "application/json" },
  });
  logger.info("User login success: " + userResponse.data.address + "\n");

  const jwt = userResponse.data.jwt;
  if (!jwt) throw new Error("Failed to retrieve JWT.");

  for (let i = 0; i < numberOfRuns; i++) {
    try {
      await uploadKnowledge(jwt);

      await sleep(2000);
    } catch (error) {
      handleError(error);
    }
  }

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

const authenticatedUser = (
  address,
  signature,
  nonce,
  issuedAt,
  expiration,
  notBefore
) => {
  return {
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
