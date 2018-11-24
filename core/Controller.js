'use-strict';
const {render} = require('mustache');
const {readFileSync, existsSync, readFile} = require('fs');
const Form = require('./utils');
class Controller {
    constructor(res,req) {
        this.res = res;
        this.req = req;
        this.skeleton = readFileSync(`${APPCONFIG.base}/skeleton.mustache`);
    }
    
    /**
     * Load views from view folder
     * @param {string} template
     * @param {JSON} data
     * @param {boolean} partial
     */
    view(template, data, partial) {
        //Checking
        if(!template || (typeof template != typeof ''))return this.res.end('404');
        
        //Mapping data
        let _data = data
        _data.title = _data.title || '';
        _data.partial = (((partial == true || partial == false) && partial) || global.partial);
        
        //Complete path or real path
        let path = `${__dirname}/../views/pages/${template}.html`;
        if (existsSync(path)) {
            readFile(path,(err,file)=>{
                if(err)return this.res.end('404');
                
                if (!_data.partial){
                    let partials = {};
                    
                    //Header, base and Footer
                    let header = readFileSync(`${APPCONFIG.components}/header.html`).toString();
                    let footer = readFileSync(`${APPCONFIG.components}/footer.html`).toString();
                    let base = readFileSync(`${APPCONFIG.base}/base.html`).toString();

                    //SideMenu
                    _data.admin = true;
                    _data.user = false;
                    let sideMenu = readFileSync(`${APPCONFIG.components}/sidemenu.html`).toString();
                    let sideMenuData = {_sidemenu_user:'Name Lastname',_sidemenu_role:'Role'};
                    
                    //Partials
                    Object.assign(partials, {
                        header:header,
                        base:base,
                        sidemenu: sideMenu,
                        content: file.toString(),
                        footer:footer
                    })
                    
                    //Data
                    Object.assign(_data,sideMenuData);

                    this.res.write(render(this.skeleton.toString(), _data, partials));
                }else{
                    this.res.write(render(file.toString(), _data));
                }

                this.res.end();
                return;
            })
        }else{
            this.res.end('404');
            return;
        };
    }
    
    /**
     * To get model without write require in controller file
     * @param {String} modelName 
     */
    model(modelName) {
        let pathModel =  `${__dirname}/../models/${modelName}.js`;
        let Model = null;
        if (existsSync(pathModel)) {
            Model = require(`../models/${modelName}`);
        }
        return new Model();
    }

    form(formName,data, title=null,action="") {
       let frm = new Form(formName,data,title,action);

       return frm.generate();
    }
    /**
 * 
 * @param {Request} request 
 * @param {Function} callback 
 */
     getDataRequest() {
        const FORM_URLENCODED = 'application/json';
        return new Promise((resolve,reject)=>{
            if (this.req.headers['content-type'] === FORM_URLENCODED) {
                let body = '';
                this.req.on('data', chunk => {
                    body += chunk.toString();
                });
                this.req.on('end', () => {
                    resolve(JSON.parse(body));
                });
            }
            else {
                reject(null);
            }
        })
        
    }
    responseData(_data) {
        let data = (typeof _data != typeof "") ? JSON.stringify(_data) : _data; 
        this.res.write(data);
        this.res.end();
    }


}
module.exports = Controller;