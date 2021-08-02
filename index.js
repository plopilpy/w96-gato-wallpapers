/*
Windows 96 PackMan repository server.

Copyright (C) Windows 96 Team (windows96.net) 2021.
*/

const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const maincfg = require('./configs/pkmsd.json');

if(maincfg.server.corsPolicy == "permissive")
    app.use(cors());

for(let mp of maincfg.repo.customUrlMappings) {
    app.use(mp.url, express.static(mp.target));
}

app.use(require('./lib/www/dir-listing'));
app.use('/', express.static(maincfg.repo.root_dir));

app.listen(maincfg.server.port, ()=>{
    console.log(`PackMan Repository Server version 1.0\nCopyright (C) Windows 96 Team 2021.\n`);
    console.log(`Listening at port [::${maincfg.server.port}]`);
    console.log(`\n<Server Parameters>`);
    console.log(` Repository Root: ${path.resolve(maincfg.repo.root_dir)}`);
    console.log(` CORS policy: ${maincfg.server.corsPolicy}`);
});