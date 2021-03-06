window.registerExtension('powerapiCI/powerapiCI_page', function (options) {
    //Clear l'affichage
    projectName = options.component.key.substring(options.component.key.indexOf(':')+1);
    options.el.textContent = '';
    loadAllHTML();
    loadAllCss();
    loadD3JS();
    loadAllJSScript();

    window.SonarRequest.getJSON('/api/issues/search', {
        resolved: false,
        componentKeys: options.component.key
    }).then(function (arg) {
        divToInsert = options.el;
        divToInsert.setAttribute('class', 'bootstrap-iso');

        establishDesign();

        searchAllSomething(["build_name", "timestamp"]).done(function (response) {
            var fields = [];
            var table_fields = response.hits.hits;
            table_fields.forEach(function (field) {
                fields.push(field._source.build_name);
                all_build_timestamp.push({build_name: field._source.build_name, timestamp: field._source.timestamp})
            });
            if (fields.length === 0) {
                divToInsert.textContent = "Aucune données n'est actuellement présente sur votre base "+ES_URL;
            } else {
                fields.sort(function(a, b){
                    if(parseInt(a) < parseInt(b)) return 1;
                    if(parseInt(a) > parseInt(b)) return -1;
                    return 0
                });
                mapSelectList(fields, LIST_COMMIT_NAME, "choose your build name", "dataFromField(this.options[this.selectedIndex].value)", fields[0]);
                dataFromField(fields[0]);
            }
        });
    });
    return function () {
        options.el.textContent = '';
    };
});

const LIST_COMMIT_NAME = "build_name";
var divToInsert;
var divForInsertingTest;
var divForInsertingMenu;
var divForChart;
var all_build_timestamp = [];
var actual_powerapi_data;
var actual_filter;
var projectName;

/* Constant des autres fichiers */
const URL_LOADED_JS_FILE = [
    "/static/powerapiCI/dependency/chart/Chart.bundle.min.js",
    "/static/powerapiCI/dependency/chart/utils/Utils.js",
    "/static/powerapiCI/view/GlobalView.js",
    "/static/powerapiCI/js/CallBdd.js",
    "/static/powerapiCI/view/MapperHTML.js",
    "/static/powerapiCI/dependency/d3js/utils/Utils.js"];

var loadAllJSScript = function () {
    URL_LOADED_JS_FILE.forEach(function (URL) {
        var script = document.createElement("script");
        script.src = URL;
        document.head.appendChild(script);
    });
};

var loadD3JS = function () {
    var script = document.createElement("script");
    script.onload = function(){
        var otherScript = document.createElement("script");
        otherScript .src = "/static/powerapiCI/dependency/d3js/utils/Box.js";
        document.head.appendChild(otherScript );
    };
    script.src ="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js";
    document.head.appendChild(script);
};

/* Constant des autres fichiers */
const URL_LOADED_CSS_FILE = [
    //"https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css",
    //"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
    "/static/powerapiCI/dependency/bootstrap-iso/bootstrap4less.css",
    "https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic-bootstrap.css",
    "/static/powerapiCI/view/css/myStyle.css",
    "/static/powerapiCI/view/css/boxPlot.css"];

var loadAllCss = function () {
    URL_LOADED_CSS_FILE.forEach(function (css) {
        var link = document.createElement("link");
        link.setAttribute('href', css);
        link.setAttribute('type', 'text/css');
        link.setAttribute('rel', 'stylesheet');
        document.head.appendChild(link);
    });
};

const URL_LOADED_HTML_FILE = [
    "/static/powerapiCI/view/html/selectList.html",
    "/static/powerapiCI/view/html/detailsTests.html",
    "/static/powerapiCI/view/html/header.html",
    "/static/powerapiCI/view/html/detailClass.html"
];

/**
 * [selectList]
 * [detailsTests]
 * [header]
 * [detailClass]
 */
var HTML_FILE = [];

var loadAllHTML = function(){
    URL_LOADED_HTML_FILE.forEach(function(htmlFile){
        jQuery.get(htmlFile, undefined, function(data) {
            var name = data.split('\n', 1)[0];
            //name.substring(0, name.length-1) : cause meta charactere
            HTML_FILE[name.substring(0, name.length-1)] = data.substring(name.length+1);
        });
    });
};

/**
 * For user press Enter and run filter
 **/
function runScript(e) {
    if (e.keyCode === 13) {
        setFilter(actual_powerapi_data, document.getElementById("filter").value)
    }
}