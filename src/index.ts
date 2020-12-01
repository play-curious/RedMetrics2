import chalk from "chalk";
import * as app from "./app";

app.server.listen(process.env.SERVER_PORT ?? 6627, () => {
  console.log(chalk.magenta("listening"), process.env.SERVER_PORT ?? 6627);
});
