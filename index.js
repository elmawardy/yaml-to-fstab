const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Handlebars = require('express-handlebars');
const cors = require('cors');
const yaml = require('js-yaml');
const fs = require('fs');
const multer  = require('multer')
var path = require('path')


const app = express()
const port = 3030

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage })

app.use(cors());
app.options('*', cors());

app.engine('handlebars', Handlebars());
app.set('view engine', 'handlebars');

// logger middleware
app.use(morgan('[:date[clf]] :remote-addr - :method :url :status :res[content-length] - :response-time ms')) 
// parse body
app.use(bodyParser.json());

app.post('/api/parse',upload.single('file'),function (req,res){
    var inputfile = req.file.filename,
    obj = yaml.load(fs.readFileSync(path.join("uploads",inputfile), {encoding: 'utf-8'}));

    var data = JSON.parse(JSON.stringify(obj, null, 2))
    var keys = Object.keys(data.fstab)
    var fstab_entries = buildFstabJson(keys,data.fstab)

    res.setHeader('Content-Type', 'text/plain')
    res.render('fstab',{
        layout: false,
        entries: fstab_entries,
        helpers:{
            stringify: function(obj){
                return JSON.stringify(obj)
            },
            default_if_null: function(options){
                return options || 'defaults';
            }
        }
    })

    removeFile(path.join("uploads",inputfile))
})

app.get('/api/example',function (req,res){
    var inputfile = 'input.yaml',
    obj = yaml.load(fs.readFileSync(inputfile, {encoding: 'utf-8'}));

    var data = JSON.parse(JSON.stringify(obj, null, 2))
    var keys = Object.keys(data.fstab)
    var fstab_entries = buildFstabJson(keys,data.fstab)

    res.setHeader('Content-Type', 'text/plain')
    res.render('fstab',{
        layout: false,
        entries: fstab_entries,
        helpers:{
            stringify: function(obj){
                return JSON.stringify(obj)
            },
            default_if_null: function(options){
                return options || 'defaults';
            }
        }
    })
})


app.listen(port,'0.0.0.0',()=>{
    console.log(`Example app listening at http://0.0.0.0:${port}`)
})

function buildFstabJson(keys,data){
    var fstab = []
    for (var i =0;i<keys.length;i++){
        var entry = {}
        var device = keys[i];

        if (data[keys[i]].type === 'nfs'){
            device = keys[i]+":"+data[keys[i]].export
        }


        entry = {...data[keys[i]],device}
        fstab.push(entry)
    }
    return fstab
}

function removeFile(filename){
    fs.unlink(filename, function(err) {
        if(err && err.code == 'ENOENT') {
            // file doens't exist
            console.info("File doesn't exist, won't remove it.");
        } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
        } else {
            console.info(`removed`);
        }
    });
}
