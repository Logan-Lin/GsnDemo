var type = "6";
var rowTag = [];
var colTag = [];
var rowStart;
var colNum = 7;
var rowNum;

var relationMatrix = [];
var historyMatrix = [];
var passengerMatrix = [];
var allocationMatrix = [];

var images = ["https://avatars2.githubusercontent.com/u/1667267?v=4&s=460",
    "https://avatars2.githubusercontent.com/u/2766936?v=4&s=460",
    "https://avatars1.githubusercontent.com/u/1794099?v=4&s=460",
    "https://avatars2.githubusercontent.com/u/1487073?v=4&s=460",
    "https://avatars2.githubusercontent.com/u/4674940?v=4&s=460",
    "https://avatars1.githubusercontent.com/u/981645?v=4&s=460",
    "https://avatars1.githubusercontent.com/u/927168?v=4&s=460",
    "https://avatars3.githubusercontent.com/u/1271349?v=4&s=460",
    "https://avatars1.githubusercontent.com/u/467807?v=4&s=460",
    "https://avatars0.githubusercontent.com/u/403637?v=4&s=460",
    "https://avatars3.githubusercontent.com/u/9321270?v=4&s=460",
    "https://avatars2.githubusercontent.com/u/11205194?v=4&s=460",
    "https://avatars3.githubusercontent.com/u/13667174?v=4&s=460",
    "https://avatars1.githubusercontent.com/u/13401724?v=4&s=460"];

$(document).ready(function() {
    $("#selected_passenger_information").find("table").attr("align", "center");

    $("#file_input_button").on("click", function() {
        type = $("input[name='type']:checked").attr("id");
        $("#file_input").click();
    });

    $("#file_input").on("change", function() {
        var selectedFile = document.getElementById("file_input").files[0];
        var reader = new FileReader();
        reader.readAsText(selectedFile);
        $(reader).on("load", function() {
            var infoString = this.result.toString();
            processInfoString(infoString);
            initialSeatButtons();
        });
    });
});

function processInfoString(infoString) {
    var planeIndex = infoString.indexOf("Plane");
    var relationIndex = infoString.indexOf("Relation");
    var historyIndex = infoString.indexOf("Histroy");
    var passengerIndex = infoString.indexOf("Passenger");
    var allocationIndex = infoString.indexOf("Allocation");

    processPlaneInfoString(infoString.substr(planeIndex, relationIndex));
    relationMatrix = processInfoMatrix(infoString.substring(relationIndex, historyIndex - 1));
    historyMatrix = processInfoMatrix(infoString.substring(historyIndex, passengerIndex - 1));
    passengerMatrix = processInfoMatrix(infoString.substring(passengerIndex, allocationIndex - 1));
    allocationMatrix = processInfoMatrix(infoString.substring(allocationIndex, infoString.length - 1));
}

function processPlaneInfoString(infoString) {
    var lines = infoString.split("\n");
    var labelString = lines[0].substr(lines[0].indexOf(":") + 1);
    var labels = labelString.split(",");
    var values = (lines[1].substring(0, lines[1].indexOf("[") - 1).split(","));
    values.push(lines[1].substring(lines[1].indexOf("["), lines[1].indexOf("]") + 1));
    values.push(lines[1].substring(lines[1].indexOf("]") + 2).split(",")[0]);
    values.push(lines[1].substring(lines[1].indexOf("]") + 2).split(",")[1]);
    rowStart = Number(values[10]);
    rowNum = Number(values[9]) - rowStart + 1;

    var planeInfoArray = [];
    for (var i = 0; i < labels.length; i++) {
        var oneInfo = labels[i] + ": " + values[i];
        planeInfoArray.push(oneInfo);
    }
    $("#plane_information").html(planeInfoArray.join(", "));
}

// 初始化座位表，将按钮绘制到座位表格上并分配对应ID
function initialSeatButtons() {
    rowTag = [];
    for (var i = 0; i < rowNum; i++) {
        rowTag.push(i + rowStart);
    }
    if (type === "9") {
        colTag = ["A", "B", "C", " " , "J", "K", "L"];
    } else if (type === "6") {
        colTag = ["A", "B", "C", " " , "D", "E", "F"];
    }

    var originalSeatTable = $("#original_seat_table");
    originalSeatTable.html("");
    var firstRow = $("<tr>");
    firstRow.append($("<td>O</td>"));
    for (var i = 0; i < colNum; i++) {
        firstRow.append($("<td>" + colTag[i] + "</td>"))
    }
    originalSeatTable.append(firstRow);
    for (var i = 0; i < rowNum; i++) {
        var tableRow = $("<tr>");
        tableRow.append($("<td>" + rowTag[i] + "</td>"));
        for (var j = 0; j < colNum; j++) {
            var id = String(rowTag[i])+ "-" + colTag[j];
            if (j === 3) {
                tableRow.append($("<td>||||</td>"));
            } else {
                tableRow.append($("<td><button class='default'" + " id=" + id + ">"
                    + " </button></td>"));
            }
        }
        originalSeatTable.append(tableRow);
    }
    var arrangedSeatTable = $("#arranged_seat_table");
    arrangedSeatTable.html("");
    originalSeatTable.find("tr").clone().appendTo(arrangedSeatTable);

    initialButtons();
    $("#original_seat").find("button.hasHistory").off("click").on(
        "click", historySeatClickHandler);
}

// 为符合条件的座位按钮分配事件处理器
function initialButtons() {
    var allocationPIDCol = allocationMatrix.map(function(value, index) {return value[0]});
    var passengerPIDCol = passengerMatrix.map(function(value, index) {return value[0]});

    // 初始化左侧座位表
    for (var i = 1; i < historyMatrix.length; i++) {
        var buttonObject = $("#original_seat").find("button[id='" +
            historyMatrix[i][2] + "']");
        buttonObject.attr("class", "hasHistory").text("P");
        if (Number(passengerMatrix[passengerPIDCol.indexOf(historyMatrix[i][0])][1]) !== 0) {
            buttonObject.addClass("hasData").attr("style", "background-image:url("
                + images[Number(historyMatrix[i][0]) % images.length] + ")").text(" ");
        }
    }

    // 初始化右侧座位表
    for (var i = 1; i < allocationMatrix.length; i++) {
        var id = getId(allocationMatrix[i][2], allocationMatrix[i][3]);
        var buttonObject = $("#arranged_seat").find("button[id='" + id + "']");
        buttonObject.attr("class", "hasHistory");
        if (Number(passengerMatrix[passengerPIDCol.indexOf(allocationMatrix[i][0])]) !== 0) {
            buttonObject.addClass("hasData").attr("style", "background-image:url("
                + images[Number(allocationMatrix[i][0]) % images.length] + ")").text(" ");
        }
    }
}

// 对按下左侧座位表上按钮事件的处理
function historySeatClickHandler(e) {
    var selectedID = e.target.getAttribute("id");
    $("table button").removeClass("selected"); // 消除其他按钮的选中属性
    $(e.target).addClass("selected"); // 将按下的按钮（座位）设为选中，效果为边缘变红

    // 取得history矩阵中代表座位位置的一列
    var historySeatIDCol = historyMatrix.map(function(value, index) {return value[2]});
    var historyRowIndex = historySeatIDCol.indexOf(selectedID);
    var selectedPid = historyMatrix[historyRowIndex][0];

    // 取得passenger矩阵中代表用户ID的一列，下同
    var passengerSeatPIDCol = passengerMatrix.map(function(value, index) {return value[0]});
    var passengerRowIndex = passengerSeatPIDCol.indexOf(selectedPid);

    var allocationSeatPIDCol = allocationMatrix.map(function(value, index) {return value[0]});
    var allocationRowIndex = allocationSeatPIDCol.indexOf(selectedPid);

    // 展示选中座位上用户的旧座位信息和历史偏好信息
    var selectedIDTable = $("#selected_passenger_information_table");
    var selectedHistoryTable = $("#selected_passenger_history_table");
    displayInfoTable(selectedIDTable, historyMatrix, historyRowIndex, 0);
    displayInfoTable(selectedHistoryTable, passengerMatrix, passengerRowIndex, 1);

    // 展示选中座位上用户的新座位的信息
    var selectedAllocationTable = $("#selected_passenger_allocation_table");
    selectedAllocationTable.html("");
    if (allocationRowIndex !== -1) {
        displayInfoTable(selectedAllocationTable, allocationMatrix, allocationRowIndex, 1);
        $("#arranged_seat_table").find("button[id='" +
            getId(allocationMatrix[allocationRowIndex][2],
                allocationMatrix[allocationRowIndex][3]) + "']").addClass("selected");
    }

    // 展示选中座位上用户的关系信息，以及绘制关系图。
    var relationMatrixPIDCol = relationMatrix.map(function(value, index) {return value[0]});
    var relationRowIndexes = getAllIndexes(relationMatrixPIDCol, selectedPid);
    var selectedRelationTable = $("#selected_passenger_relation_table");
    selectedRelationTable.html("");

    var graphElement = document.getElementById("graph");
    $(graphElement).html("");
    if (relationRowIndexes.length > 0) {
        var relationRow = $("<tr>");
        relationRow.append($("<td>Related person</td>"));
        for (var i = 0; i < relationRowIndexes.length; i++) {
            relationRow.append($("<td>" + relationMatrix[relationRowIndexes[i]][1] + "</td>"));
        }
        selectedRelationTable.append(relationRow);

        var relationGraph = Viva.Graph.graph();
        relationGraph.addNode(selectedPid, {url: images[Number(selectedPid) % images.length]});
        for (var i = 0;i < relationRowIndexes.length; i++) {
            var relatedPID = relationMatrix[relationRowIndexes[i]][1];
            relationGraph.addNode(relatedPID,
                {url: images[Number(relatedPID) % images.length]});
            relationGraph.addLink(selectedPid, relatedPID);
        }

        var graphics = Viva.Graph.View.svgGraphics();
        graphics.node(function(node) {
            return Viva.Graph.svg('image')
                .attr('width', 50)
                .attr('height', 50)
                .link(node.data.url);
        }).placeNode(function(nodeUI, pos){
                nodeUI.attr('x', pos.x - 12).attr('y', pos.y - 12);
        });

        var renderer = Viva.Graph.View.renderer(relationGraph, {
                container: graphElement,
                graphics: graphics
        });
        renderer.run();
    }
}

// 给出表格对象、信息所在矩阵和用户所在行数以及信息开始的列数，即可在表格内展示相应信息
function displayInfoTable(tableObject, infoMatrix, rowIndex, infoStartColIndex) {
    tableObject.html("");
    var row1 = $("<tr>");
    var row2 = $("<tr>");
    for (var i = infoStartColIndex; i < infoMatrix[0].length; i++) {
        row1.append($("<td>" + infoMatrix[0][i] + "</td>"));
        row2.append($("<td>" + infoMatrix[rowIndex][i] + "</td>"));
    }
    tableObject.append(row1);
    tableObject.append(row2);
}

// 得到某个值在数组中的全部出现位置
function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) !== -1){
        indexes.push(i);
    }
    return indexes;
}

// 输入代表行和列的字符串，得到格式类似"13-D"的座位ID
function getId(rowStr, colStr) {
    var temColTag = [];
    for (var i = 0; i < 3; i++) {
        temColTag.push(colTag[i])
    }
    for (i = 4; i < colNum; i++) {
        temColTag.push(colTag[i]);
    }
    return rowStr + "-" + temColTag[Number(colStr) - 1];
}

// 处理从TXT读入的信息字符串，切割成矩阵
function processInfoMatrix(infoString) {
    var lines = infoString.split("\n");
    var infoMatrix = [];
    infoMatrix.push(lines[0].substring(lines[0].indexOf(":") + 1).split(","));
    for (var i = 1; i < lines.length; i++) {
        infoMatrix.push(lines[i].split(","));
    }
    return infoMatrix;
}

// function allocatedSeatClickHandler(e) {
//     var selectedID = e.target.getAttribute("id");
//     $("table button").removeClass("selected");
//     $(e.target).addClass("selected");
//
//     var seatStringArray = selectedID.split("-");
//     var temColTag = [];
//     for (var i = 0; i < 3; i++) {
//         temColTag.push(colTag[i])
//     }
//     for (i = 4; i < colNum; i++) {
//         temColTag.push(colTag[i]);
//     }
// }