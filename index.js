const express = require('express')
const PORT = 9666
const app = express()
const http = require('http')
const server = http.Server(app)
const openpgp = require('openpgp')

class OpenPGPGenerator{
    constructor(){

    }
    generate(name, email, passphrase){
        var options = {
            passphrase,
            userIds: [{ name, email }], // multiple user IDs
            numBits: 4096,                                            // RSA key size
        };
        return openpgp.generateKey(options).then((key) => {
            var privKey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
            var pubKey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
            const result = {
                public: pubKey,
                private: privKey,
                error: false
            }
            console.log("Result", result)
            return result
        });
    }
}
class OpenPGPServer{
    constructor(){
        this.generator = new OpenPGPGenerator()
        this._setupListeners()
        this._startServer()
    }
    _startServer(){
        server.listen(PORT, (err)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log("Flying on port " + PORT)
            }
        })
    }
    _setupListeners(){
        app.post('/', (req, res) => {
            let {name, email, password} = req.body
            res.setTimeout(240000, function(){
                console.log('Request has timed out.');
                    res.send(408);
                });
            this.generator.generate(name, email, password)
                .then((r) => this._sendResult(r, res))
           //     .catch((err) =>  this._sendError(err, res))
        })
        app.get('/', (req, res) =>{ 
            let {name, email, password} = req.query
            res.setTimeout(240000, function(){
                console.log('Request has timed out.');
                    res.send(408);
                });
            this.generator.generate(name, email, password)
                .then((r) => this._sendResult(r, res))
         //       .catch((err) =>  this._sendError(err, res))
        })
    }
    _sendResult(result, res){
        this._sendJSON(result, res)
    }
    _sendError(err, res){
        this._sendJSON({
            error: true,
            errors: [err]
        }, res)
    }
    _sendJSON(result, res){
        res.send(JSON.stringify(result))
    }
}

openPGPDemoServer = new OpenPGPServer()

module.exports = openPGPDemoServer

