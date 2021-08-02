/*
Windows 96 PackMan repository server.

Copyright (C) Windows 96 Team (windows96.net) 2021.
*/

const templater = require("../util/templater");
const fs = require('fs');
const path = require('path');
const pages = require('../../configs/pages.json');

const dirListingDoc = fs.readFileSync(pages.dir_view.docPath, {
    encoding: 'utf-8'
});

/**
 * Dir listing handler.
 * @param {import('express').Request} req The request to process.
 * @param {import('express').Response} res The response to process.
 * @param {import('express').NextFunction} next Next function.
 */
async function handler(req, res, next) {
    const rootPath = path.resolve("./public");
    const itemPath = path.join(path.resolve("./public"), req.url);

    // Deny any requests outside of public path
    if(!itemPath.startsWith(rootPath)) {
        res.status(403);

        if(pages.access_denied)
            res.sendFile(pages.access_denied.docPath);
        else
            res.send("403 Access denied.");

        res.end();
    }

    try {
        const stat = await fs.promises.stat(itemPath);

        if(stat.isFile()) {
            next(); // We won't handle this one.
            return;
        }
    } catch(e) {
        // Display 404
        res.status(404);

        if(pages.not_found)
            res.sendFile(pages.not_found.docPath);
        else
            res.send("404 not found.");

        res.end();
        return;
    }

    let README = "";
    let DIRS = "";

    // Check for readme
    try {
        const readmePath = path.join(itemPath, "README.txt");
        const stat = await fs.promises.stat(readmePath);
        
        if(stat.isFile()) {
            README = templater.process(pages.dir_view.templates.readme, {
                TEXT: await fs.promises.readFile(readmePath, { encoding: "utf-8" })
            });
        }
    } catch(e) {
        // No readme was found
    }

    // List items

    try {
        const items = await fs.promises.readdir(itemPath, { withFileTypes: true });

        // Sort the items
        items.sort(function(a, b){
            if(!a.isFile()) return -1;
            else return 1;
        });

        if(!((req.url == "") || (req.url == "/"))) {
            // Add up item
            DIRS += templater.process(pages.dir_view.templates.directory, {
                FRIENDLY_NAME: "Up..",
                URL: ((!req.url.endsWith("/")) ? req.url + "/" : req.url) + ".."
            });
        }
        
        for(let item of items) {
            DIRS += templater.process(item.isFile() ? pages.dir_view.templates.file : pages.dir_view.templates.directory, {
                FRIENDLY_NAME: item.name,
                URL: ((!req.url.endsWith("/")) ? req.url + "/" : req.url) + item.name
            });
        }
    } catch(e) {
        res.status(500);
        res.end("An error occured.");
        console.error(e);
        return;
    }
    
    res.contentType('text/html');
    res.status(200);
    res.end(templater.process(dirListingDoc, {
        README,
        DIR: req.url,
        DIRS
    }));
}

module.exports = handler;