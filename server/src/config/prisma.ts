const fs = require("fs");
const runTerminalCommand = require("../utils/runTerminalCommand.js");

const getPrismaInstance = async (datasourceUrl, companyId) => {
  if (!fs.existsSync("./prisma")) fs.mkdirSync("./prisma");

  fs.writeFileSync(`./prisma/${companyId}.prisma`, prismaTemplate(datasourceUrl, companyId));

  await runTerminalCommand(`npx prisma db pull --schema="./prisma/${companyId}.prisma"`);

  await runTerminalCommand(`npx prisma generate --schema="./prisma/${companyId}.prisma"`);

  const { PrismaClient } = require(`@internal/${companyId}/client`);
  const prismaClientInstance = new PrismaClient({
    datasourceUrl: datasourceUrl,
  });

  return prismaClientInstance;
};

const prismaTemplate = (datasourceUrl: string, id) => `
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/@internal/${id}/client"
}

datasource db {
  provider = "mysql"
  url      = "${datasourceUrl}"
}
`;

module.exports = getPrismaInstance;
