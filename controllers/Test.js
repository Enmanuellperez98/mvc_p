const A_CONTROLLER = require('../core/Controller');

module.exports = class Test extends A_CONTROLLER {

    constructor(res) {
        super(res);
    }

    index() {
        this.view('Home', {title:'Home',content: 'Conten:'});
    }
    
    test(a,b,c){
        console.log(a,b,c)
    }
}