import * as ink from 'https://deno.land/x/ink/mod.ts'
import { sleep } from "https://x.nest.land/sleep@1.0.0/mod.ts";
import qrcode from 'https://deno.land/x/qrcode_terminal/mod.js'

let text = "\n\nHi, I am Alpaca Bi, A Web Full Stack Developer From China\n"

let text2 = "👇 Hit in your terminal to connect with me."
let text3 = ink.colorize('<yellow>*******************</yellow>')
let text4 = ink.colorize('<yellow>*  npx alpaca-bi  *</yellow>')
let text5 = ink.colorize('<yellow>*******************</yellow>\n\n')

console.log(text)

await sleep(1.5)

console.log(text2)
console.log(text3)
console.log(text4)
console.log(text5)

await sleep(1.5)

let text6 = "If you think the project has helped you, you can buy a cup of coffee for me!!!\n"
let text7 = ink.colorize('<green>WeChat Pay</green> 👇')
let text8 = ink.colorize('\n<blue>AliPay</blue> 👇')

console.log(text6)

await sleep(1.5)

console.log(text7)
qrcode.generate("wxp://f2f0KtjBVNpOFTX96GYJRZSYJGwMoOnJtIYm", {small: true})

await sleep(1.5)
console.log(text8)
qrcode.generate("https://qr.alipay.com/fkx17442xocvwp4p9sfgn98", {small: true})
console.log("\n\n")

await sleep(1.5)