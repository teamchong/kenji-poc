const puppeteer = require('puppeteer')
const fsPromises = require('fs').promises
const randomUA = require('modern-random-ua')

const query = process.env.QUERY

if (!query) {
    console.error('query is empty')
    process.exit(1)
}

const url = 'https://www.wine-searcher.com/find/summer'
const uaString = randomUA.generate().replace(/Firefox\/[\d\.]+/, 'Firefox/60.0.1')
const newDate = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-');

(async () => {
    try {
        const browser = await puppeteer.launch({ args: [
            '--no-sandbox', '--disable-setuid-sandbox',
            '--enable-features=NetworkService'
        ]})
        const page = await browser.newPage()
        await page.setUserAgent(uaString)
        await page.goto(url)

        const html = await page.evaluate(() => document.body.innerHTML)

        // expecting something like this <input type="text" maxlength="100" name="Xwinename" id="Xwinename" value="ab" placeholder="Type any wine name" class="typeahead sch-fld-main formplaceholder tt-input" tabindex="1" title="Search phrase" autocomplete="off" autocorrect="off" spellcheck="false" dir="auto" style="position: relative; vertical-align: top;">
        const isHtmlOk = !/Please +verify +you +are +a +human/i.test(html)
        const fileSuffix = isHtmlOk ? '-ok' : '-fail'

        // do your parsing here
        const items = await page.$$eval('tr.wlrwdt ', trs => { return trs.map(anchor => anchor.textContent).slice(0, 10) })
        const result = JSON.stringify(items)

        if (isHtmlOk) {
            console.log(['!#RESULT-FOR-', query, '#!', result].join(''))
        }

        if (process.env.NODE_ENV !== 'production') {
            // Screenshot for debug, safe to remove
            await page.screenshot({ path: `/app/log/${newDate}${fileSuffix}.jpg`, type: 'jpeg' })

            // Log for debug, safe to remove
            await fsPromises.writeFile(`/app/log/${newDate}${fileSuffix}.log`, `URL ${url}
UA ${uaString}
HTML ${html}
RESULT ${result}`)
        }

        await browser.close()
    }
    catch (ex) {
        console.error(ex)
        process.exit(1)
    }
})()