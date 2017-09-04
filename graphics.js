// JavaScript Document
$(function () {
    var canvas = document.getElementById('thetoroid'), // The canvas where life is drawn
        graphCanvas = document.getElementById('thegraph'), // The canvas where the graph is drawn
        showGraph = false,
        $teller = $('#teller'),
        $cellsAlive = $('#cellsalive'),
        $speed = $('#speed'),
        $bugData = $('#bugData table'),
        cellSize = 1, // Width and heigth of a cell in pixels
        spaceWidth = (canvas.width / cellSize),
        spaceHeight = (canvas.height / cellSize),
        numberCells = spaceWidth * spaceHeight, // Number of available cells
        liveCells = [], // Array with x,y coordinates of living cells
        fillRatio = 20, // Percentage of available cells that will be set alive initially
        startnumberLivecells = numberCells * fillRatio / 100,
        yScale = 3 * graphCanvas.height / numberCells, //Ratio to apply values on y-axis
        cellsAlive, // Number of cells alive
        neighbours, // Array with neighbours count
        steps = 0, // Number of iterations / steps done
        prevSteps = 0,
        interval = 0, // Milliseconds between iterations
        running = false,
        liferules = [],
        gogogo = null,
        speedHandle = null,
        speed = 0,
        cellNutritionValue = 3,
        stepEnergy = 2,
        minBugFat = 10,
        bugs = [],
        deadBugCells = [];


    // Set some variables
    function setSpace() {
        spaceWidth = (canvas.width / cellSize);
        spaceHeight = (canvas.height / cellSize);
        numberCells = spaceWidth * spaceHeight;
        startnumberLivecells = numberCells * fillRatio / 100;
        cellsAlive = startnumberLivecells;
    }

    // Empty the arrays to get ready for restart.
    function initArrays() {
        liveCells = [];
        deadBugCells = [];
        neighbours = [];
        bugs = [];
    }

    function initLiferules() {
        var count;
        var $checkbox;
        for (count = 0; count < 10; count++) {
            $checkbox = $('#newlife' + count);
            if ($checkbox.length) {
                liferules[count] = $checkbox.is(":checked");
            } else {
                liferules[count] = false;
            }
        }
        for (count = 10; count < 19; count++) {
            $checkbox = $('#staylife' + (count - 10));
            if ($checkbox.length) {
                liferules[count] = $checkbox.is(":checked");
            } else {
                liferules[count] = false;
            }
        }
    }

    // Erase the canvas
    function clearSpace() {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Erase the graph
    function clearGraph() {
        var ctx = graphCanvas.getContext('2d');
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Put new pair of values in array
    function celXY(x, y) {
        this.x = x;
        this.y = y;
    }

    // Fill livecells with random cellxy's
    function fillRandom() {
        var count;
        for (count = 0; count < startnumberLivecells; count++) {
            liveCells[count] = new celXY(Math.floor(Math.random() * spaceWidth), Math.floor(Math.random() * spaceHeight));
        }
    }

    // Fade the old screen a bit to white
    function fadeAll() {
        var ctx = canvas.getContext('2d');
        if ($('.trails').is(":checked")) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        } else {
            ctx.fillStyle = "rgb(255, 255, 255)";
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Fade the old graph a bit to white
    function fadeGraph() {
        var ctx = graphCanvas.getContext('2d');
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, graphCanvas.width, graphCanvas.height);
    }

    // Draw the array with livecells
    function drawCells() {
        var ctx = canvas.getContext('2d');
        var count;
        ctx.fillStyle = "rgb(128, 128, 0)";
        for (count in liveCells) {
            ctx.fillRect(liveCells[count].x * cellSize, liveCells[count].y * cellSize, cellSize, cellSize);
        }
        cellsAlive = liveCells.length;
    }

    // Fill livecells with your own mouse drawing
    $('#thetoroid').on('click', function (event) {
        mouseX = Math.floor((event.offsetX ? (event.offsetX) : event.pageX - this.offsetLeft) / cellSize);
        mouseY = Math.floor((event.offsetY ? (event.offsetY) : event.pageY - this.offsetTop) / cellSize);
        liveCells.push(new celXY(mouseX, mouseY));
        drawCells();
        updateData();
    });

    // Draw the array with livecells
    function drawGraph() {
        var ctx = graphCanvas.getContext('2d');
        ctx.fillStyle = "rgb(128, 128, 0)";
        ctx.fillRect(steps % graphCanvas.width, graphCanvas.height - cellsAlive * yScale, 1, 1);
    }

    // Calculate generations per second
    function calcSpeed() {
        speed = steps - prevSteps;
        prevSteps = steps;
    }

    // Update the counter
    function updateData() {
        $teller.text(steps);
        $cellsAlive.text(cellsAlive);
        $speed.text(speed);
    }

    // Set all neighbours to zero
    function zeroNeighbours() {
        var count;
        for (count = 0; count < numberCells; count++) {
            neighbours[count] = 0;
        }
    }

    // Tell neighbours around livecells they have a neighbour
    function countNeighbours() {
        var count, thisx, thisy, dx, dy;
        for (count in liveCells) {
            thisx = liveCells[count].x;
            thisy = liveCells[count].y;
            for (dy = -1; dy < 2; dy++) {
                for (dx = -1; dx < 2; dx++) {
                    neighbours[((thisy + dy) * spaceWidth + thisx + dx + numberCells) % numberCells]++;
                }
            }
            neighbours[thisy * spaceWidth + thisx] += 9;
        }
    }

    // Check if a liveCell is 'in' a bug, if so, feed the bug
    function eaten(x, y) {
        var thisBug;
        function inCircle(x, y, bug) {
            return ((Math.pow(x - bug.x, 2) + Math.pow(y - bug.y, 2)) < Math.pow(bug.radius, 2));
        }
        for (var count in bugs) {
            thisBug = bugs[count];
            if (inCircle(x, y, thisBug)) {
                thisBug.feed();
                return true;
            }
        }
        return false;
    }

    // Evaluate neighbourscounts for new livecells
    function evalNeighbours() {
        var count, thisx, thisy;

        function livecell() {
            thisy = Math.floor(count / spaceWidth);
            thisx = count - (thisy * spaceWidth);
            if (!eaten(thisx, thisy)) {
                liveCells.push(new celXY(thisx, thisy));
            }
        }

        liveCells = [];
        for (count = 0; count < numberCells; count++) {
            if (liferules[neighbours[count]]) {
                livecell();
            }
        }
    }

    // Draw the bugs
    function drawBugs() {
        var ctx = canvas.getContext('2d');
        var thisBug;
        var deadBugs = [];
        for (var count in bugs) {
            thisBug = bugs[count];
            ctx.fillStyle = (thisBug.gender == 1) ? "rgba(128,0,0,0.5)" : "rgba(0,0,128,0.5)";
            ctx.beginPath();
            ctx.arc(thisBug.x, thisBug.y, thisBug.radius * cellSize, 0, 2 * Math.PI);
            ctx.fill();
            thisBug.move();
            if (!thisBug.alive) {
                deadBugs.push(count);
            }
        }
        for (var i in deadBugs) {
            bugs.splice(deadBugs[i], 1);
        }
    }

    function xWrap(x) {
        return Math.floor((x + canvas.width) % canvas.width);
    }

    function yWrap(y) {
        return Math.floor((y + canvas.height) % canvas.height);
    }

    function fixedDecimals(num, dec) {
        return parseFloat(num).toFixed(dec);
    }

    function randomBug() {
        return {
            id: Math.floor(Math.random() * 1000000),
            fat: 25,
            radius: 2,
            alive: true,
            x: Math.floor(Math.random() * spaceWidth) * cellSize,
            y: Math.floor(Math.random() * spaceHeight) * cellSize,
            direction: Math.floor(Math.random() * 8) * 0.125 * 2 * Math.PI,
            turnProbability: Math.random(),
            turnDirection: function () {
                return (Math.random() > .5) ? 1 : -1;
            },
            gender: Math.floor(Math.random() * 2),
            move: function () {
                this.x = xWrap(this.x + Math.cos(this.direction));
                this.y = yWrap(this.y + Math.sin(this.direction));
                this.fat -= stepEnergy;
                this.radius = Math.ceil(Math.sqrt(this.fat / (2 * Math.PI)));
                if (this.fat < minBugFat) {
                    this.die();
                }
                this.showData();
            },
            feed: function () {
                if (this.alive) {
                    this.direction = (Math.random() < this.turnProbability) ? this.direction + this.turnDirection() * 0.125 : this.direction;
                    this.fat += cellNutritionValue;
                }
            },
            showData: function () {
                var $tr = $('<tr id="bug' + this.id + '"></tr>');
                var $oldTr = $('#bug' + this.id);
                $tr.append('<td>' + this.id + '</td>');
                $tr.append('<td>' + this.alive + '</td>');
                $tr.append('<td>' + this.gender + '</td>');
                $tr.append('<td>' + this.fat + '</td>');
                $tr.append('<td>' + this.radius + '</td>');
                $tr.append('<td>' + fixedDecimals(this.direction, 2) + '</td>');
                $tr.append('<td>' + fixedDecimals(this.turnProbability, 2) + '</td>');
                $tr.append('<td>' + this.turnDirection() + '</td>');
                if ($oldTr.length) {
                    $oldTr.replaceWith($tr)
                } else {
                    $bugData.append($tr);
                }
            },
            die: function () {
                var r, angle, x, y;
                this.alive = false;
                for (var i = 0; i < 100; i++) {
                    r = Math.random() * 100;
                    angle = Math.random() * 2 * Math.PI;
                    x = xWrap(this.x + Math.cos(angle) * r);
                    y = yWrap(this.y + Math.sin(angle) * r);
                    deadBugCells.push(new celXY(x, y));
                }
            }
        }
    }

    function addBugs(amount) {
        for (var count = 0; count < amount; count++) {
            bugs.push(randomBug());
        }
        console.log(bugs);
    }

    // Animation function
    function animateShape() {
        steps += 1;
        if (deadBugCells.length) {
            liveCells = liveCells.concat(deadBugCells);
            deadBugCells = [];
        }
        zeroNeighbours();
        countNeighbours();
        evalNeighbours();
        fadeAll();
        drawCells();
        drawBugs();
        if (showGraph) {
            drawGraph();
        }
        updateData();
    }

    function firstStep() {
        if (canvas.getContext) {
            setSpace();
            yScale = 3 * graphCanvas.height / numberCells;
            initArrays();
            initLiferules();
            clearSpace();
            fillRandom();
            drawCells();
            addBugs(10);
            drawBugs();
            fadeGraph();
        } else {
            // canvas-unsupported code here
            document.write("If you see this, you&rsquo;d better install Firefox or Chrome or Opera or Safari or &hellip;");
        }
    }

    // Do one life step
    function steplife() {
        animateShape();
    }
    $('#stepbutton').on('click', function () {
        steplife();
    });
    shortcut.add("right", function () {
        steplife();
    });

    function setIntervals() {
        gogogo = setInterval(animateShape, interval);
        speedHandle = setInterval(calcSpeed, 1000);
    }

    function clearIntervals() {
        clearInterval(gogogo);
        clearInterval(speedHandle);
    }

    // Start life animation
    function startLife() {
        $('.trails').attr('checked', true);
        if (running === false) {
            setIntervals();
        }
        running = true;
    }
    $('#startbutton').on('click', function () {
        startLife();
    });
    shortcut.add("up", function () {
        startLife();
    });

    // Show start button again after user clicked stopbutton
    function stopLife() {
        clearIntervals();
        running = false;
    }
    $('#stopbutton').on('click', function () {
        stopLife();
    });
    shortcut.add("down", function () {
        stopLife();
    });

    // Restart everything when user clicks restart button
    function restartLife() {
        if (running === true) {
            clearIntervals();
        }
        running = false;
        steps = 0;
        prevSteps = 0;
        firstStep();
        $('.trails').attr('checked', true);
        if (running === false) {
            setIntervals();
        }
        running = true;
    }
    $('#randombutton').on('click', function () {
        restartLife();
    });
    shortcut.add("return", function () {
        restartLife();
    });

    // Clear the canvas (in order to draw manually on it)
    function clearLife() {
        if (running === true) {
            clearIntervals();
        }
        running = false;
        steps = 0;
        setSpace();
        initArrays();
        clearSpace();
        updateData();
    }
    $('#clearbutton').on('click', function () {
        clearLife();
    });
    shortcut.add("delete", function () {
        clearLife();
    });

    // Toggle trails on or off
    shortcut.add("insert", function () {
        if ($('.trails').is(":checked")) {
            $('.trails').attr('checked', false);
        } else {
            $('.trails').attr('checked', true);
        }
    });

    // Add a bug
    $('#bugbutton').on('click', function () {
        console.log('add bug');
        addBugs(1);
    });

    // Toggle graph on or off
    $('#graphtoggler').on('click', function () {
        showGraph = !showGraph;
        $('#thegraph').toggle('slow');
    });

    // Toggle liferules checkboxes on or off
    $('#rulestoggler').on('click', function () {
        $('#liferules').toggle('slow');
    });

    // Toggle text on or off
    $('#texttoggler').on('click', function () {
        $('#story').toggle('slow');
    });

    $('#liferules input').on('click', function () {
        initLiferules();
    });

    firstStep();
    if (running === false) {
        // startLife();
    }

});	