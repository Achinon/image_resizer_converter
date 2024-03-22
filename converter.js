const fs = require('fs'),
    { Resizer, Prompt } = require('./assets/core');

const prompts = {
    order: ['extension', 'mode', 'one'],
    extension: new Prompt(
        "Specify extension to which you want images being converted: ",
        "Specified extension is not allowed.",
        res => `Extension ${res} selected...`,
        ['webp', 'png', 'jpg', 'jpeg']
    ),
    mode: new Prompt(
        "Should I convert all images or do you want to specify just one?: [one/all] ",
        "Unknown argument given.",
        res => `Conversion mode ${res} toggled...`,
        ['one', 'all']
    ),
    one: new Prompt(
        "Give an exact name of the file (with current extension) you wish to convert from ./img/to convert/ folder: ",
        "Unknown error.",
        res => `Converting ${res}...`,
        ''
    )
}

Resizer
    .createStack(prompts)
    .launch();