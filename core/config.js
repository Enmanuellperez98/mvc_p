
Object.defineProperty(global, 'APPCONFIG', {
    get: () => { 
        return {
            connection: {
                host: "",
                user: "",
                password:"",
                database: ""
            },
            view: '.././view/',
            model: '.././models/',
            controller: `${__dirname}/controllers`,
            base: `${__dirname}/../views/base`,
            components: `${__dirname}/../views/base/components`,
        }
    },
    set: () => {}
});
