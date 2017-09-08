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
        fillRatio = 20, // Percentage of available cells that will be set alive initially (20)
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

        startBugsCount = 20,
        cellNutritionValue = 3,
        stepEnergy = 1,
        minBugFat = 50,
        adultFat = 1000,
        graveRadius = 100,
        graveMultiplier = 20,
        bugs = [],
        maleCount = function () {
            return bugs.filter(function (value, i, bugs) {
                return value.gender == 1;
                // console.log(value, i, bugs);
            }).length;
        },
        femaleCount = function () {
            return bugs.length - maleCount();
        },
        bugsYscale,
        deadBugCells = [],
        walkers = [
            [[-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]],
            [[1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]],
            [[0, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]],
            [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1]]
        ];

    // Set some variables
    function initVariables() {
        spaceWidth = (canvas.width / cellSize);
        spaceHeight = (canvas.height / cellSize);
        numberCells = spaceWidth * spaceHeight;
        startnumberLivecells = numberCells * fillRatio / 100;
        cellsAlive = startnumberLivecells;
        yScale = 3 * graphCanvas.height / numberCells;
        bugsYscale = (maleCount() != Infinity) ? Math.floor(graphCanvas.height / maleCount()) : graphCanvas.height / 5;
    }

    // Empty the arrays to get ready for restart.
    function initArrays() {
        liveCells = [];
        deadBugCells = [];
        neighbours = [];
        bugs = [];
        $bugData.find('tbody tr').remove();
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
    function fadeCells() {
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

    // Draw the array with livecells
    function drawGraph() {
        var ctx = graphCanvas.getContext('2d');
        ctx.fillStyle = "rgb(128, 128, 0)";
        ctx.fillRect(steps % graphCanvas.width, graphCanvas.height - cellsAlive * yScale, 1, 1);
        ctx.fillStyle = (steps % 2 == 0) ? "rgba(128,0,0,0.3)" : "rgba(0,0,0)";
        ctx.fillRect(steps % graphCanvas.width, graphCanvas.height - maleCount() * 10, 1, 1);
        ctx.fillStyle = (steps % 2 == 0) ? "rgba(0,0,0)" : "rgba(0,0,128,0.3)";
        ctx.fillRect(steps % graphCanvas.width, graphCanvas.height - femaleCount() * 10, 1, 1);
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

    // Let bugs avoid each other
    function avoidOrAttractOthers() {
        for (var i = 0; i < bugs.length; i++) {
            var thisBug = bugs[i];
            var tempDirection = thisBug.direction;
            for (var j = i + 1; j < bugs.length; j++) {
                var thatBug = bugs[j];
                var distance = Math.sqrt(Math.pow((thisBug.x - thatBug.x), 2) + Math.pow((thisBug.x - thatBug.x), 2));
                var minDistance = thisBug.radius + thatBug.radius + 7;
                if (distance < minDistance) {
                    if (thisBug.adult() && thatBug.adult() && thisBug.gender !== thatBug.gender) {
                        thisBug.mating = true;
                        thatBug.mating = true;
                        giveBirth(thisBug, thatBug);
                        thisBug.offspring++;
                        thatBug.offspring++;
                        thisBug.fat -= minBugFat;
                        thatBug.fat -= minBugFat;
                    } else {
                        thisBug.direction = thatBug.direction + Math.PI / 4;
                        thatBug.direction = tempDirection - Math.PI / 4;
                    }
                    thisBug.hasTurned = true;
                    thatBug.hasTurned = true;
                }
            }
        }
    }

    // Draw the bugs
    function drawBugs() {
        var ctx = canvas.getContext('2d');
        var thisBug;
        var deadBugs = [];
        for (var i = 0; i < bugs.length; i++) {
            var thisBug = bugs[i];
            ctx.fillStyle = (thisBug.gender == 1) ? "rgba(128,0,0,0.5)" : "rgba(0,0,128,0.5)";
            ctx.beginPath();
            ctx.arc(thisBug.x, thisBug.y, thisBug.radius * cellSize, 0, 2 * Math.PI);
            ctx.fill();
            if (thisBug.alive) {
                thisBug.move();
            } else {
                deadBugs.push(i);
                thisBug.die();
            }

        }
        for (var j = 0; j < deadBugs.length; j++) {
            bugs.splice(deadBugs[j], 1);
        }
    }

    function fixedDecimals(num, dec) {
        var decimalFactor = Math.pow(10, dec);
        return Math.round(num * decimalFactor) / decimalFactor;
    }

    function xWrap(x) {
        return (x + canvas.width) % canvas.width;
    }

    function yWrap(y) {
        return (y + canvas.height) % canvas.height;
    }

    function fatToRadius(fat) {
        return (fat > 0) ? Math.ceil(Math.sqrt(fat / (2 * Math.PI))) : 0;
    }

    function randomSign() {
        return (Math.random() > Math.random()) ? 1 : -1;
    }

    function random01() {
        return Math.floor(Math.random() * 2);
    }

    function giveBirth(thisBug, thatBug) {
        var center = {
            x: xWrap(Math.round((thisBug.x + thatBug.x) / 2)),
            y: yWrap(Math.round((thisBug.y + thatBug.y) / 2))
        };
        var strongestBug = (thisBug.fat > thatBug.fat) ? thisBug : thatBug;
        var weakestBug = (thisBug.fat < thatBug.fat) ? thisBug : thatBug;
        var newBornBug = new randomBug();
        newBornBug.x = center.x + Math.random() * 100 + strongestBug.radius;
        newBornBug.y = center.y + Math.random() * 100 + strongestBug.radius;
        newBornBug.turnProbability = strongestBug.turnProbability + randomSign() * weakestBug.turnProbability / 10;
        newBornBug.turnAmount = strongestBug.turnAmount + randomSign() * weakestBug.turnAmount / 10;
        newBornBug.poopFrequency = strongestBug.poopFrequency + randomSign() * weakestBug.poopFrequency / 10;
        bugs.push(newBornBug);
    }

    function randomBug() {
        return {
            id: Math.floor(Math.random() * 1000000000),
            fat: 2 * minBugFat,
            alive: true,
            steps: 0,
            offspring: 0,
            x: fixedDecimals((Math.random() * spaceWidth) * cellSize, 2),
            y: fixedDecimals((Math.random() * spaceHeight) * cellSize, 2),
            direction: Math.floor(Math.random() * 8) * 0.125 * 2 * Math.PI,
            turnProbability: Math.random(),
            turnAmount: Math.random() * Math.PI / 2,
            turnDirection: randomSign,
            hasTurned: false,
            gender: random01(),
            adult: function () {
                return this.fat > adultFat;
            },
            mating: false,
            remnantCells: minBugFat,
            radius: fatToRadius(this.remnantCells),
            maxRadius: 15,
            poopFrequency: Math.floor(Math.random() * 40 + 10),
            move: function () {
                if (this.fat < this.remnantCells) {
                    this.alive = false;
                } else {
                    this.x = fixedDecimals(xWrap(this.x + Math.cos(this.direction)), 2);
                    this.y = fixedDecimals(yWrap(this.y + Math.sin(this.direction)), 2);
                    this.fat -= stepEnergy;
                    this.radius = Math.min(fatToRadius(this.fat), this.maxRadius);
                    this.steps++;
                    this.hasTurned = false;
                    if (this.steps % this.poopFrequency == 0) {
                        this.poop();
                    }
                }
                this.showData();
            },
            feed: function () {
                if (this.alive) {
                    this.fat += cellNutritionValue;
                    if (!this.hasTurned) {
                        // if (Math.random() < this.turnProbability) {
                        this.direction = (this.direction + this.turnDirection() * this.turnAmount) % (Math.PI * 2);
                        this.hasTurned = true;
                        // }
                    }
                }
            },
            poop: function () {
                var self = this,
                    poo = {},
                    cells = [];
                poo.x = Math.round(Math.cos(this.direction + Math.PI) * (this.radius + 2) + self.x);
                poo.y = Math.round(Math.sin(this.direction + Math.PI) * (this.radius + 2) + self.y);
                cells = $.extend(true, {}, walkers[Math.floor(Math.random() * walkers.length)]); // deep copy
                for (var key in cells) {
                    if (cells.hasOwnProperty(key)) {
                        var cell = cells[key];
                        cell[0] = xWrap(cell[0] + poo.x);
                        cell[1] = yWrap(cell[1] + poo.y);
                        deadBugCells.push(new celXY(cell[0], cell[1]));
                    }
                }
            },
            // Uit object halen?
            showData: function () {
                var $oldTr = $('#bug' + this.id);
                if (this.alive) {
                    var $tr = $('<tr id="bug' + this.id + '"></tr>');
                    $tr.append('<td>' + this.id + '</td>');
                    $tr.append('<td>' + this.gender + '</td>');
                    $tr.append('<td>' + this.fat + '</td>');
                    $tr.append('<td>' + this.radius + '</td>');
                    // $tr.append('<td>' + this.x + '</td>');
                    // $tr.append('<td>' + this.y + '</td>');
                    // $tr.append('<td>' + fixedDecimals(this.direction / Math.PI, 2) + '</td>');
                    $tr.append('<td>' + fixedDecimals(this.turnAmount / Math.PI, 2) + '</td>');
                    $tr.append('<td>' + fixedDecimals(this.turnProbability, 2) + '</td>');
                    $tr.append('<td>' + this.offspring + '</td>');
                    $tr.append('<td>' + this.steps + '</td>');
                    if ($oldTr.length) {
                        $oldTr.replaceWith($tr)
                    } else {
                        $bugData.append($tr);
                    }
                } else {
                    $oldTr.remove();
                }
            },
            die: function () {
                var r, angle, x, y;
                for (var i = this.fat * graveMultiplier; i > 0; i--) {
                    r = Math.random() * graveRadius + this.maxRadius;
                    angle = Math.random() * 2 * Math.PI;
                    x = xWrap(Math.round(this.x + Math.cos(angle) * r));
                    y = yWrap(Math.round(this.y + Math.sin(angle) * r));
                    deadBugCells.push(new celXY(x, y));
                }
                this.fat = 0;
                this.showData();
            }
        }
    }

    function addBugs(amount) {
        for (var count = 0; count < amount; count++) {
            bugs.push(randomBug());
        }
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
        fadeCells();
        drawCells();
        avoidOrAttractOthers();
        drawBugs();
        if (showGraph) {
            drawGraph();
        }
        if (steps % canvas.width == 0) {
            fadeGraph();
        }
        updateData();
    }

    function firstStep() {
        if (canvas.getContext) {
            initVariables();
            initArrays();
            initLiferules();
            clearSpace();
            fillRandom();
            drawCells();
            addBugs(startBugsCount);
            drawBugs();
            updateData();
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
        initVariables();
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

    // Fill livecells with your own mouse drawing
    $('#thetoroid').on('click', function (event) {
        mouseX = Math.floor((event.offsetX ? (event.offsetX) : event.pageX - this.offsetLeft) / cellSize);
        mouseY = Math.floor((event.offsetY ? (event.offsetY) : event.pageY - this.offsetTop) / cellSize);
        liveCells.push(new celXY(mouseX, mouseY));
        drawCells();
        updateData();
    });

    firstStep();
    if (running === false) {
        startLife();
    }

});	
