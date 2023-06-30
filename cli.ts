/**
 * This module is written in deno
 */

import { createSMMS, DEFAULT_ENDPOINT } from "./smms.ts";

const HOME = Deno.build.os === "windows" ? Deno.env.get("USERPROFILE")! : Deno.env.get("HOME")!;
const CONF = `${HOME}/.smms-cli`;
const conf: Partial<{ token: string; endpoint: string }> = { endpoint: DEFAULT_ENDPOINT };

try {
    // read config file
    const f = await Deno.readTextFile(CONF);
    Object.assign(conf, JSON.parse(f));
} catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
        throw err;
    }
    await Deno.writeTextFile(CONF, "{}");
}

const assignAndSaveConf = (obj: typeof conf) => Deno.writeTextFile(CONF, JSON.stringify(Object.assign(conf, obj)));

/**
 * the smms instance with config file read
 */
const smms = createSMMS(conf);

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

/**
 * upload an image, from local path or remote url
 */
async function upload(path: string) {
    const file = await pathToFile(path);
    return await smms.upload(file);
}

//! export
export { smms, upload };

//! command line
if (import.meta.main) {
    // const { parse } = await import("https://deno.land/std@0.192.0/flags/mod.ts");

    const help = () => {
        console.error(
            `Usage: smms <command>

COMMANDS:
    login <username> <password>  : login to cli, config file saved to ~/.smms-cli
    logout                       : logout from cli
    upload <path>...             : upload image
    profile                      : show my profile
    history                      : ip based histoy
    clear                        : clear history
    list                         : show upload images by account
    delete <hash>                : get hash from 'list' subcommand, and delete it from account
    typora <path>...             : upload image, in typora compatible mode
    endpoint <url>               : change endpoint, default is 'https://smms.app/api/v2/'
    help                         : show this message`
        );
        Deno.exit(0);
    };

    if (Deno.args.length === 0) help();

    switch (Deno.args[0]) {
        case "login":
            {
                let [username, password] = Deno.args.slice(1);
                if (!username) username = prompt("Enter your username:")!;
                if (!password) password = prompt("Enter your password:")!;
                const x = await smms.token(username, password);
                console.log(x.message);
                if (x.success) await assignAndSaveConf({ token: x.data.token });
            }
            break;
        case "logout":
            {
                await assignAndSaveConf({ token: "" });
                console.log("Logged out");
            }
            break;
        case "upload":
            {
                const uploadOnePath = async (path: string) => {
                    const x = await upload(path);
                    if (x.success) console.log(x.data);
                    else console.log(x.message);
                };
                const paths = Deno.args.slice(1);
                if (paths.length <= 1) {
                    let [path] = paths;
                    if (!path) path = prompt("Enter the image path:")!;
                    uploadOnePath(path);
                } else {
                    for (const path of paths) await uploadOnePath(path);
                }
            }
            break;
        case "profile":
            {
                const x = await smms.profile();
                if (x.success) console.log(x.data);
                else console.log(x.message);
            }
            break;
        case "history":
            {
                const x = await smms.history();
                if (x.success) console.log(x.data);
                else console.log(x.message);
            }
            break;
        case "list":
            {
                const x = await smms.uploadHistory();
                if (x.success) console.log(x.data);
                else console.log(x.message);
            }
            break;
        case "delete":
            {
                const [hash] = Deno.args.slice(1);
                const x = await smms.delete(hash);
                if (x.success) console.log(x.data);
                else console.log(x.message);
            }
            break;
        case "help":
            {
                help();
            }
            break;
        case "typora":
            {
                const uploadOne = async (path: string) => {
                    const x = await upload(path);
                    if (x.success) return x.data.url;
                    else if (x.code === "image_repeated") return x.images;
                    else return "";
                    // return empty string, means upload fail
                };
                const paths = Deno.args.slice(1);
                if (paths.length === 0) {
                    console.log(`[How to use the typora compatible mode]

Typora > Preferences > Image > Image Upload Setting

Image Uploader = Custom Command
Command        = "smms typora"`);
                    Deno.exit(0);
                }
                const result: string[] = [];
                let successCount = 0;
                for (const path of paths) {
                    const url = await uploadOne(path);
                    if (url) {
                        successCount++;
                        result.push(url);
                    } else {
                        result.push(`<fail to upload ${path}>`);
                    }
                }
                if (successCount === paths.length) {
                    console.log("%cUpload Success:", "text-decoration: underline; font-weight: bold");
                    console.log(result.join("\n"));
                } else {
                    console.error(
                        `%cUpload Fail (${successCount}/${paths.length}):`,
                        "text-decoration: underline; font-weight: bold; color: red"
                    );
                    console.error(result.join("\n"));
                }
            }
            break;
        case "endpoint":
            {
                const [endpoint] = Deno.args.slice(1);
                if (endpoint) {
                    await assignAndSaveConf({ endpoint });
                    console.log(`Endpoint set to ${endpoint}`);
                } else {
                    console.log(
                        `Usage: smms endpoint <url>` +
                            `\n\n` +
                            `Example: smms endpoint https://smms-app-zkoxoimpf2yd.curlhub.io/api/v2/` +
                            `\n` +
                            `Default endpoint is ${DEFAULT_ENDPOINT}` +
                            `\n` +
                            `Current endpoint is ${conf.endpoint}`
                    );
                }
            }
            break;
        default: {
            console.error(`smms: '${Deno.args[0]}' is not a command. See 'smms help'.`);
        }
    }
}
