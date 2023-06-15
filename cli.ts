import { upload, token, profile, history, uploadHistory, deleteImage } from "./smms.ts";

const HOME = Deno.build.os === "windows" ? Deno.env.get("USERPROFILE")! : Deno.env.get("HOME")!;
const CONF = `${HOME}/.smms-cli`;

const conf: Partial<{ token: string }> = {};

try {
    const f = await Deno.readTextFile(CONF);
    Object.assign(conf, JSON.parse(f));
} catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
        throw err;
    }
    await Deno.writeTextFile(CONF, "{}");
}

function help() {
    console.log(`Usage: "${Deno.execPath()}" run "${new URL(import.meta.url).pathname}"

COMMANDS:
    login <username> <password>  : login to cli, config file saved to ~/.smms-cli
    logout                       : logout from cli
    upload <path>                : upload a image
    profile                      : show my profile
    history                      : ip based histoy
    clear                        : clear history
    list                         : show upload images by account
    delete <hash>                : get the hash from 'list' subcommand, and delete from account
    help                         : show this message`);
    Deno.exit(0);
}

if (Deno.args.length === 0) help();

switch (Deno.args[0]) {
    case "login":
        {
            let [username, password] = Deno.args.slice(1);
            if (!username) username = prompt("Enter your username:")!;
            if (!password) password = prompt("Enter your password:")!;
            const x = await token(username, password);
            console.log(x.message);
            if (x.success) {
                Object.assign(conf, { token: x.data.token });
                await Deno.writeTextFile(CONF, JSON.stringify(conf));
            }
        }
        break;
    case "logout":
        {
            Object.assign(conf, { token: "" });
            await Deno.writeTextFile(CONF, JSON.stringify(conf));
            console.log("Logged out");
        }
        break;
    case "upload":
        {
            let [path] = Deno.args.slice(1);
            if (!path) path = prompt("Enter the image path:")!;
            const f = await Deno.readFile(path);
            const x = await upload(conf.token!, new File([f], path));
            if (x.success) console.log(x.data);
            else console.log(x.message);
        }
        break;
    case "profile":
        {
            const x = await profile(conf.token!);
            if (x.success) console.log(x.data);
            else console.log(x.message);
        }
        break;
    case "history":
        {
            const x = await history(conf.token!);
            if (x.success) console.log(x.data);
            else console.log(x.message);
        }
        break;
    case "list":
        {
            const x = await uploadHistory(conf.token!);
            if (x.success) console.log(x.data);
            else console.log(x.message);
        }
        break;
    case "delete":
        {
            const [hash] = Deno.args.slice(1);
            const x = await deleteImage(conf.token!, hash);
            if (x.success) console.log(x.data);
            else console.log(x.message);
        }
        break;
    default:
        help();
}
