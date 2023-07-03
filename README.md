# smms-app

[sm.ms](https://smms.app) api and command line written in Deno

```sh
# install
deno install --allow-env --allow-read --allow-write --allow-net -n smms https://denopkg.com/yieldray/smms-app/cli.ts

# uninstall
deno uninstall smms

# upgrade
deno cache -r https://denopkg.com/yieldray/smms-app/cli.ts
deno install -f --allow-env --allow-read --allow-write --allow-net --allow-run -n smms https://denopkg.com/yieldray/smms-app/cli.ts

# dev install
deno install -f -A -n smms ./cli.ts
```
