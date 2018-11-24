'use-strict'

//MySql Driver
var mysql = require('mysql');

module.exports = class Model {
    
    constructor() {
        Object.defineProperty(this, 'conn', {
            get: () => { return mysql.createConnection(APPCONFIG.connection)},
            set: () => {}
        });
    }

    /**
     * Run query
     * @param {string} stringQuery 
     * @param {Array} data 
     */
    query(stringQuery,data = null) { 
        return new Promise((resolve,reject)=>{
            this.conn.connect();
            this.conn.query(stringQuery,[data], (error,result) => {
                if (error) reject(error);
                resolve(result);
            });
            this.conn.end();
        })
    }
    /**
     * ***
     * INSERT DATA
     * ***
     * @param  {[JSON]} data JSON array with data to insert
     * @param  {String} table Table name  to insert data
     * 
     */
    async insert(data, table) {
        let sqlString  = null;
        let sqlField = [];
        let sqlData  = [];
        let wrongField = [];
        let dataTableInfo = await this.query(`SELECT COLUMN_NAME as col FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${APPCONFIG.connection.database}' AND TABLE_NAME = '${table}'`);
        let tmp = {};
        dataTableInfo = dataTableInfo.forEach((el)=>{tmp[el.col] = true});
        dataTableInfo = tmp;
        if (data.length > 0) {
            Object.keys(data[data.length-1]).forEach( (k) => { // Extract fields
                if(dataTableInfo[k]){
                    sqlField.push(k);
                }else{
                    wrongField.push(k);
                }
            });
            if(wrongField.length == 0) {
                let sqlFieldString  =   sqlField.toString();
                sqlString = `INSERT INTO ${table} (${sqlFieldString}) VALUES ?`;
                
                for (let i = 0; i < data.length; i++) {
                    let row = data[i];
                    sqlData.push(Object.values(row));
                }
                return new Promise(resolve => {
                    this.query(sqlString,sqlData).then(rs => {
                        if (rs.affectedRows) {
                            resolve(data);
                        }
                    })
                })
            } else {
                return {message:`${wrongField.join()}`,type:-1}
            }
        }
    }

    update(_data,table) {
        let data = _data[0]        
        let sqlField = [];
        const WHERE = `WHERE id = ${data.id}`;
        delete data.id;
        if(data) {
            Object.keys(data).forEach((k) => { 
               sqlField.push(`${k} = '${data[k]}'`)
            });
        }
        const sql = `UPDATE ${table} SET ${sqlField.join()} ${WHERE}`;
        
        return new Promise(resolve=>{
            this.query(sql).then(rs=>{
                if(rs.affectedRows) {
                    resolve(data);
                }
            })
        })
           
        
        
    }
}