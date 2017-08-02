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

$(document).ready(function() {
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
    firstRow.append($("<td>O</td>"))
    for (var i = 0; i < colNum; i++) {
        firstRow.append($("<td>" + colTag[i] + "</td>"))
    }
    originalSeatTable.append(firstRow);
    for (var i = 0; i < rowNum; i++) {
        var tableRow = $("<tr>");
        tableRow.append($("<td>" + rowTag[i] + "</td>"))
        for (var j = 0; j < colNum; j++) {
            var id = String(rowTag[i])+ "-" + colTag[j];
            if (j === 3) {
                tableRow.append($("<td>||||</td>"));
            } else {
                tableRow.append($("<td><button class='default'" + " id=" + id + ">"
                    + "P</button></td>"));
            }
        }
        originalSeatTable.append(tableRow);
    }
    var arrangedSeatTable = $("#arranged_seat_table");
    arrangedSeatTable.html("");
    originalSeatTable.find("tr").clone().appendTo(arrangedSeatTable);

    initialHistoryButtons();
    initialArrangedButtons();
    $("#original_seat").find("button.hasHistory").off("click").on(
        "click", historySeatClickHandler);
}

function initialHistoryButtons() {
    var allocationPIDCol = allocationMatrix.map(function(value, index) {return value[0]});

    for (var i = 1; i < historyMatrix.length; i++) {
        var buttonObject = $("#original_seat").find("button[id='" +
            historyMatrix[i][2] + "']");
        buttonObject.attr("class", "hasHistory");
        if (allocationPIDCol.indexOf(historyMatrix[i][0]) !== -1) {
            buttonObject.addClass("hasData");
        }
    }
}

function initialArrangedButtons() {
    for (var i = 1; i < allocationMatrix.length; i++) {
        var id = getId(allocationMatrix[i][2], allocationMatrix[i][3]);
        $("#arranged_seat").find("button[id='" + id + "']").attr("class", "hasData");
    }
}

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

function processInfoMatrix(infoString) {
    var lines = infoString.split("\n");
    var infoMatrix = [];
    infoMatrix.push(lines[0].substring(lines[0].indexOf(":") + 1).split(","));
    for (var i = 1; i < lines.length; i++) {
        infoMatrix.push(lines[i].split(","));
    }
    return infoMatrix;
}

function historySeatClickHandler(e) {
    var selectedID = e.target.getAttribute("id");
    $("table button").removeClass("selected");
    $(e.target).addClass("selected");

    var historySeatIDCol = historyMatrix.map(function(value, index) {return value[2]});
    var historyRowIndex = historySeatIDCol.indexOf(selectedID);
    var selectedPid = historyMatrix[historyRowIndex][0];

    var passengerSeatPIDCol = passengerMatrix.map(function(value, index) {return value[0]});
    var passengerRowIndex = passengerSeatPIDCol.indexOf(selectedPid);

    var allocationSeatPIDCol = allocationMatrix.map(function(value, index) {return value[0]});
    var allocationRowIndex = allocationSeatPIDCol.indexOf(selectedPid);
    //displayInformation(historyRowIndex, passengerRowIndex);

    var selectedIDTable = $("#selected_passenger_information_table");
    var selectedHistoryTable = $("#selected_passenger_history_table");
    displayInfoTable(selectedIDTable, historyMatrix, historyRowIndex, 0);
    displayInfoTable(selectedHistoryTable, passengerMatrix, passengerRowIndex, 1);

    var selectedAllocationTable = $("#selected_passenger_allocation_table");
    selectedAllocationTable.html("");
    if (allocationRowIndex !== -1) {
        displayInfoTable(selectedAllocationTable, allocationMatrix, allocationRowIndex, 1);
        $("#arranged_seat_table").find("button[id='" +
            getId(allocationMatrix[allocationRowIndex][2],
                allocationMatrix[allocationRowIndex][3]) + "']").addClass("selected");
    }
}

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