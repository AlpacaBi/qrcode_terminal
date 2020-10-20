# QRCode Terminal For Deno


## Run the Demo
```bash
deno run https://deno.land/x/qrcode_terminal/demo/demo.js
```

## Examples
```js
import qrcode from 'https://deno.land/x/qrcode_terminal/mod.js'

console.log("\n\nScan It Skip To Google 👇\n")
qrcode.generate("https://www.google.com")
```