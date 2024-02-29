
var row;

function start() {
    row = event.target;
}
function dragover() {
    var e = event;
    e.preventDefault();

    let children = Array.from(e.target.parentNode.parentNode.children);

    let children_index = children.indexOf(e.target.parentNode)
    let row_index = children.indexOf(row)
    if (children_index > row_index)
        e.target.parentNode.after(row);
    else
        e.target.parentNode.before(row);

    if (children_index != row_index) {
        // console.log(children_index);
        // console.log(row_index);


        newdata = tableToJson(document.getElementById('storedata'));
        // let dd= "{test:" + {newdata} +"}";
        console.log(newdata)
        let cattitle = document.getElementById('catTitle').value;
        // console.log(cattitle)
        localStorage.setItem(cattitle, JSON.stringify(newdata));

    }
}

function tableToJson(table) {
    var data = [];

    // first row needs to be headers
    var headers = [];
    for (var i = 1; i < table.rows[0].cells.length - 1; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
    }

    // go through cells

    for (var i = 1; i < table.rows.length; i++) {

        var tableRow = table.rows[i];
        var rowData = {};

        for (var j = 1; j < tableRow.cells.length - 1; j++) {

            rowData[headers[j]] = tableRow.cells[j].innerHTML;

        }

        data.push(rowData);
    }
    return data;
}


function saveWorkspace() {
    let cattitle = document.getElementById('catTitle').value;
    console.log(cattitle)
    // const content = JSON.stringify(Blockly.serialization.workspaces.save(Blockly.getMainWorkspace()));
    const content = localStorage.getItem(cattitle);
    console.log(content);
    try {
        const link = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        let cattitle = document.getElementById('catTitle').value;
        link.download = cattitle + ".json";
        link.click();
        URL.revokeObjectURL(link.href);

    } catch (e) {
        // Storage can be flakey.
        console.log(e);

    }
}


function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        displayContents(contents);
    };
    reader.readAsText(file);
}

function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.textContent = contents;
}

document.getElementById('file-input')
    .addEventListener('change', readSingleFile, false); function readSingleFile(e) {
        var file = e.target.files[0];
        const filename = file.name.split('.').slice(0, -1).join('.')
        console.log(filename);
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var contents = e.target.result;

            displayContents(contents);


            let cattitle = document.getElementById('catTitle');
            cattitle.value = filename;
            var element = document.getElementById('file-content');
            var contents = element.textContent;

            //console.log(contents);
            const newdata = JSON.parse(contents);

            localStorage.setItem(filename, JSON.stringify(newdata));

        };
        reader.readAsText(file);
    }

function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.textContent = contents;
}
document.getElementById('file-input')
    .addEventListener('change', readSingleFile, false);