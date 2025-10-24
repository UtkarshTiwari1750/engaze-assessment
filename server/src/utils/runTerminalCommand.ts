const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

const runTerminalCommand = async (command: string) => {
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = runTerminalCommand;
