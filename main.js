'use-strict';

const http = require('http');
const {
    URL
} = require('url');
const fs = require('fs');
const {
    extname
} = require('path');
const mime = require('./core/mime');

//Home
const Home = require('./controllers/Home');

//Settings
const HOST = '127.0.0.1';
const PORT = 3000;
require('./core/config');
const source = 'public';

const server = http.createServer((req, res) => {
    const {
        headers,
        method,
        url
    } = req;

    var urlBody = new URL(url, `http://${headers.host}`);

    var path = urlBody.pathname;
    global.queryString = urlBody.searchParams;

    global.partial = headers.partial == 'true' ? true : false;

    //First step
    global.POST = req.method == 'POST' ? true : false;
    global.GET = req.method == 'GET' ? true : false;

    router(path, res, req);
});

server.listen(PORT, HOST, () => {});

/**
 * Router
 * @param {string} path The http.clientServer path
 * @param {Response} res The object Response
 */
function router(path, res, req) {
    //Home
    if (path == '/') {
        new Home(res).index();
        return;
    }
    if (path) {
        path = ((path.split(/\//))).slice(1);

        path[0] = path[0].replace(/[^a-z]/ig, '');
        //Resource
        if (path[0] == source) {
            let route = '';
            for (let i = 0; i < path.length; i++) {
                if (path[i]) {
                    if (path[i].search(/[\/\\\*\"\<\>\|:\s]/ig) > -1) {
                        res.writeHead(400);
                        res.end('400 Bad Request');
                    } else {
                        route += '/' + path[i];
                    }
                }
            }

            if (fs.existsSync(`${__dirname}/${route}`) && !fs.lstatSync(`${__dirname}/${route}`).isDirectory()) {
                let stream = fs.createReadStream(`${__dirname}/${route}`);
                stream.on('open', function () {
                    res.setHeader('Content-Type', mime(extname(`${__dirname}/${route}`)));
                    stream.pipe(res);
                })
            } else {
                res.write('404');
                res.end();
            }
        } else {
            if (fs.existsSync(`${__dirname}/controllers/${path[0]}.js`) && !fs.lstatSync(`${__dirname}/controllers/${path[0]}.js`).isDirectory()) {
                var controller = require(`${__dirname}/controllers/${path[0]}.js`);
                var controller = new controller(res, req);
                if (path[1]) {
                    path[1] = path[1].replace(/[^a-z]/ig, '');
                    if (controller[path[1]]) {
                        if (path.length > 2) {
                            var params = (path.slice(2)).toString();
                            //Attentive this is a waste of resources, but there is no other possible way
                            try {
                                (Function('controller', `controller['${path[1]}'](${params})`))(controller);
                            } catch (err) {
                                res.write('404');
                                res.end();
                            }
                        } else {
                            controller[path[1]]();
                        }
                    } else {
                        res.end('404');
                    }
                } else {
                    controller.index();
                }
            } else {
                res.writeHead(404);
                res.end('404');
            };
        }
    } else {
        res.writeHead(404);
        res.end('404');
    }
}
//>>