const fs = require("fs");
const md5File = require("md5-file");
const archiver = require("archiver");
const moveFile = require("move-file");

const bookNumber = "22493";

const files = [];
const md5s = [];

fs.readdirSync("./brfs/").forEach(file => {
  files.push(file);
});

for (let i = 0; i < files.length; i++) {
  if (fs.existsSync("./brfs/" + files[i])) {
    md5s[i] = md5File.sync("./brfs/" + files[i]);
  }
}

for (let i = 0; i < files.length; i++) {
  console.log(files[i] + ': ' + md5s[i]);
}

let output = fs.createWriteStream("br." + bookNumber + ".zip");
var archive = archiver("zip", {
  zlib: {
    level: 0
  }
});

output.on("close", () => {
  console.log(archive.pointer() + " total bytes");
});

output.on("end", () => {
  console.log("Data has been drained");
});

archive.on("warning", err => {
  if (err.code === "ENOENT") {
  } else {
    throw err;
  }
});

archive.on("error", err => {
  throw err;
});

archive.on("error", err => {
  throw err;
});

archive.pipe(output);

for (let i = 0; i < files.length; i++) {
  archive.file("./brfs/" + files[i], {
    name: files[i]
  });
}

console.log("ZIP Saved");
archive.finalize();

let xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' + 
  "<!DOCTYPE diskcheck [<!ELEMENT diskcheck (book, file+)>\n" +
  "<!ATTLIST diskcheck\n" + 
  'version CDATA #FIXED "1.0"\n' +
  ">\n" + 
  "<!ELEMENT book (#PCDATA)>\n" + 
  "<!ELEMENT file (filename, checksum)>\n" + 
  "<!ATTLIST file\n" + 
  "type CDATA #IMPLIED\n" + 
  "content CDATA #IMPLIED\n" + 
  ">\n" +
  "<!ELEMENT filename (#PCDATA)>\n" + 
  "<!ELEMENT checksum (#PCDATA)>\n" + 
  "<!ATTLIST checksum\n" + 
  "type CDATA #REQUIRED\n" + 
  ">]>\n" + 
  '<diskcheck version="1.0">\n' + 
  "\t<book>" + bookNumber +"</book>\n";

for (let i = 0; i < files.length; i++) {
  if (i !== files.length - 1) {
    xml +=
      "\t<file>\n" +
      "\t\t<filename>" + files[i] + "</filename>\n" +
      '\t\t<checksum type="MD5">' + md5s[i] + "</checksum>\n" +
      "\t</file>\n";
  } else {
    xml +=
      "\t<file>\n" +
      "\t\t<filename>" + files[i] + "</filename>\n" +
      '\t\t<checksum type="MD5">' + md5s[i] + "</checksum>\n" +
      "\t</file>\n" +
      "</diskcheck>";
  }
}

fs.writeFile("br." + bookNumber + ".md5", xml, err => {
  if (err) throw err;
  console.log("MD5 Saved");
});

fs.mkdirSync(__dirname + "/br" + bookNumber);

(async () => {
  await moveFile(
    __dirname + "/br." + bookNumber + ".zip",
    __dirname + "/br" + bookNumber + "/br." + bookNumber + ".zip"
  );
  console.log("MD5 has been moved");
})();

(async () => {
  await moveFile(
    __dirname + "/br." + bookNumber + ".md5",
    __dirname + "/br" + bookNumber + "/br." + bookNumber + ".md5"
  );
  console.log("ZIP has been moved");
})();
