class Util {
    async newPageWithNewContext(browser) {
        const {
            browserContextId
        } = await browser._connection.send('Target.createBrowserContext')
        const page = await browser._createPageInContext(browserContextId)
        page.browserContextId = browserContextId

        return page
    }

    async closePage(browser, page) {
        if (page.browserContextId != undefined) {
            await browser._connection.send('Target.disposeBrowserContext', {
                browserContextId: page.browserContextId
            })
        } else {
            await page.close()
        }
    }

    /**
     * Array.forEach but blocking.
     * @param array array to iterate.
     * @param callback callback function to call for every iteration. 
     */
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }

    /**
     * Sleep.
     * @param ms sleep time on milliseconds.
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    base64Decode(string) {
        const buff = Buffer.from(string, 'base64')
        return buff.toString('ascii')
    }

    /**
     * Get all query parameter from a url
     * @param url url
     * @param toLowerCase bool
     */
    getAllUrlParams(url, toLowerCase = false) {
        let queryString = url.split('?')[1]
        let obj = {}
        
        if (queryString) {
            queryString = queryString.split('#')[0]
            let arr = queryString.split('&')

            for (let i = 0; i < arr.length; i++) {
                let a = arr[i].split('=') // separate the keys (param name) and the values (param value)
                let paramName = a[0]
                let paramValue = typeof (a[1]) === 'undefined' ? true : a[1]

                if (toLowerCase) {
                    paramName = paramName.toLowerCase()
                    if (typeof paramValue === 'string')
                        paramValue = paramValue.toLowerCase()
                }

                // if the paramName ends with square brackets, e.g. colors[] or colors[2]
                if (paramName.match(/\[(\d+)?\]$/)) {
                    // create key if it doesn't exist
                    let key = paramName.replace(/\[(\d+)?\]/, '')
                    if (!obj[key])
                        obj[key] = []

                    // if it's an indexed array e.g. colors[2]
                    if (paramName.match(/\[\d+\]$/)) {
                        // get the index value and add the entry at the appropriate position
                        let index = /\[(\d+)\]/.exec(paramName)[1]
                        obj[key][index] = paramValue
                    } else {
                        // otherwise add the value to the end of the array
                        obj[key].push(paramValue)
                    }
                } else {
                    // we're dealing with a string
                    if (!obj[paramName]) {
                        // if it doesn't exist, create property
                        obj[paramName] = paramValue
                    } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                        // if property does exist and it's a string, convert it to an array
                        obj[paramName] = [obj[paramName]]
                        obj[paramName].push(paramValue)
                    } else {
                        // otherwise add the property
                        obj[paramName].push(paramValue)
                    }
                }
            }
        }

        return obj
    }
}

module.exports = new Util