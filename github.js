let request = require("request");
let cheerio = require("cheerio");
let url = "https://github.com/topics"
let fs = require("fs")
let path = require("path")
request(url, (error, response, html) => {
    if (error) {
        console.log(error)
    } else {
        let selectorTool = cheerio.load(html);
        let name = selectorTool(".topic-box.position-relative.hover-grow.height-full.text-center.border.color-border-secondary.rounded.color-bg-primary.p-5 .no-underline.d-flex.flex-column.flex-justify-center")
        for (let i = 0; i < name.length; i++) {
            let singlelink = selectorTool(name[i]).attr("href")
            // console.log(singlelink);
            let foldername = singlelink.split('/').pop()
            fs.mkdir(path.join(__dirname, '/data/' + foldername), (err) => {
                if (err) {
                    return console.error(err);
                }
            });

            let fulllink = "https://github.com" + singlelink;
            goToSpecificPage(fulllink, foldername)
        }
    }
});


function goToSpecificPage(fullLink, foldername) {
    request(fullLink, (error, res, html) => {
        if (error) console.log(error);
        else {
            let selectorTool = cheerio.load(html);

            let name = selectorTool('.h1-mktg').text().trim()
            let repos = selectorTool(".f3.color-text-secondary.text-normal.lh-condensed a.text-bold")

            for (let i = 0; i < 8; i++) {
                let singlereponame = selectorTool(repos[i]).attr("href");
                let singlerepolink = "https://github.com" + singlereponame
                let purereponame = singlereponame.split('/').pop() + ".json"
                let locpath = __dirname + "\\data\\" + foldername + "\\" + purereponame
                // console.log(singlerepolink);
                gotorepomakefile(singlerepolink, locpath)
            }
            // console.log('``````````````````````````````````````````');
        }
    })
}

function gotorepomakefile(link, locpath) {
    request(link + "/issues", (error, response, html) => {
        if (error) {
            console.log(error)
        } else {
            let arr = []
            let selectorTool = cheerio.load(html);
            let all = selectorTool('.js-navigation-container.js-active-navigation-container')
            let issue = all.find('.flex-auto a.Link--primary')
            console.log(issue.length, link);

            for (let i = 0; i < issue.length; i++) {
                let obj = {}
                obj.issue = selectorTool(issue[i]).text()
                obj.link = selectorTool(issue[i]).attr("href")
                arr.push(obj)
            }

            fs.writeFile(locpath, JSON.stringify(arr), function (err) {
                if (err) throw err;
                // console.log('File is created successfully.');
            });
            console.table(arr);
        }
    });
}