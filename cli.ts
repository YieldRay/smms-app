import { createSMMS } from "./smms.ts";
const { upload, token, profile, history, uploadHistory, delete: deleteImage } = createSMMS();

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

/**
 * local path or remote url, to file
 */
async function pathToFile(path: string) {
    const url = /^https?:\/\//.test(path) ? new URL(path) : new URL(`file://${await Deno.realPath(path)}`);
    const res = await fetch(url);
    const blob = await res.blob();
    const fileName = decodeURIComponent(url.pathname.split("/").toReversed()[0]);
    const type = res.headers.has("content-type") ? res.headers.get("content-type")! : undefined;
    const file = new File([blob], fileName, { type });
    return file;
}

function help() {
    console.error(
        `Usage: smms <command>

COMMANDS:
    login <username> <password>  : login to cli, config file saved to ~/.smms-cli
    logout                       : logout from cli
    upload <path>                : upload an image
    profile                      : show my profile
    history                      : ip based histoy
    clear                        : clear history
    list                         : show upload images by account
    delete <hash>                : get hash from 'list' subcommand, and delete it from account
    help                         : show this message`
    );
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
            const f = await pathToFile(path);
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
    case "help":
        {
            help();
        }
        break;
    default: {
        console.error(`smms: '${Deno.args[0]}' is not a command. See 'smms help'.`);
    }
}
