const fs = require('fs'),
    rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    Resizer = {
        dirs: {
            toConvert: './img/to convert',
            converted: './img/converted'
        },
        resps: [],
        createStack (prompts) {
            return new Stack(prompts);
        },
        run(){
            console.log(this);
        },
        throwError(string) {
            console.log(`\r\n\x1b[31m${string}\x1b[0m 
            \r\nClosing...`);
            process.exit(2137);
        },
        convertFileName (fileName) {
            const { dirs, resps } = this,
                fileNameArray = fileName.split('.');
            let newFileName = '', id = 0;

            for (const i of fileNameArray) {
                if (id < fileNameArray.length - 1)
                    newFileName += `.${i}`;
                id++;
            }

            return (newFileName.slice(1) + `.${resps[0]}`).replace(dirs.toConvert, dirs.converted);
        }
    },
    sharp = require('sharp');

class Stack {
    load = [];

    push(object) { return this.load.push(object) }

    pop() { return this._canPop() ? this.load.pop() : false }

    _canPop(){ return this._size > 0; }

    get _size(){
        let count = 0;
        for(const i of this.load)
            count++;
        return count;
    }

    constructor(prompts) {
        for (const i of prompts.order)
            this.push(prompts[i])

        this.load.reverse();
    }

    launch() {
        this.pop().ask(this);
    }
};

class Prompt {
    constructor(q, e, s, a) {
        this.question = q;
        this.error = e;
        this.success = s;
        this.allowed = a;

        this.ask = function (stack) {
            rl.question(`\r\n${this.question}`, req => {
                const request = req.toLowerCase();

                let isReqAllowed = false;

                for (const a of this.allowed) {
                    if (request === a) {
                        isReqAllowed = true;
                        break;
                    }
                }

                if (!isReqAllowed) {
                    isReqAllowed = this.customHandler();
                    if(!isReqAllowed) {
                        Resizer.throwError(this.error)
                    }
                }

                console.log(`\r\n${this.success(`\x1b[36m${request}\x1b[0m`)}`);

                Resizer.resps.push(request);

                if (request === 'all')
                    this.finish();
                else {
                    const newPrompt = stack.pop();
    
                    newPrompt ?
                        newPrompt.ask(stack) :
                        this.finish()
                }
            });
        }

        this.customHandler = function () {
            if(typeof this.allowed === 'string')
                return true;
        }

        this.finish = () => {
            rl.close();
            const { dirs, resps } = Resizer;

            if(resps[1] === 'one'){
                const fileName = `${dirs.toConvert}/${resps[2]}`;
                fs.readFile(
                    fileName, 
                    'utf8', 
                    err => {
                        if (err) {
                            Resizer.throwError('Specified file does not exist.')
                        }
                        const newFileName = Resizer.convertFileName(fileName);

                        sharp(fileName)
                            .toFile(newFileName)
                            .then(() => {
                                console.log(`Success converting ${newFileName}`);
                            })
                            .catch(err => console.log(err));
                    }
                );
            }
            else {
                fs
                    .readdirSync(dirs.toConvert)
                    .forEach(fileName => {
                        if(fileName[0] != '.'){
                            fileName = `${dirs.toConvert}/${fileName}`;

                            const newFileName = Resizer.convertFileName(fileName);
                            
                            sharp(`${fileName}`)
                                .toFile(`${newFileName}`)
                                .then(() => {
                                    console.log(`Success converting ${newFileName}`);
                                })
                                .catch(err => console.log(err));
                        }
                    });
            }
        }
    }
};

module.exports = { Resizer, Prompt };