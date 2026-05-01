import chalk from "chalk";

export const printResults = (results) => {
  let working = 0;
  let broken = 0;
  let redirect = 0;

  console.log("URL".padEnd(50), "STATUS", "TYPE", "TIME");
  console.log("-".repeat(80));

  results.forEach((result) => {
    let color = chalk.white;

    if (result.type === "WORKING") {
      color = chalk.green;
      working += 1;
    } else if (result.type === "BROKEN") {
      color = chalk.red;
      broken += 1;
    } else if (result.type === "REDIRECT") {
      color = chalk.yellow;
      redirect += 1;
    }

    console.log(
      result.url.slice(0, 50).padEnd(50),
      String(result.status).padEnd(8),
      color(result.type).padEnd(10),
      result.responseTime,
    );
  });

  console.log("\n📊 Summary:");
  console.log(chalk.green(`Working: ${working}`));
  console.log(chalk.red(`Broken: ${broken}`));
  console.log(chalk.yellow(`Redirect: ${redirect}`));
};
