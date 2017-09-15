$(function () {

    var canvas = document.getElementById('thetoroid'), // The canvas where life is drawn
        graphCanvas = document.getElementById('thegraph'), // The canvas where the graph is drawn

        $teller = $('#teller'),
        $cellsAlive = $('#cellsalive'),
        $speed = $('#speed'),
        $bugData = $('#bugData table'),
        $cellNutritionValue = $('.cellNutrition'),

        bugId = 1,
        adultFat = 1500,
        bounceCycles = 100,
        bugs = [],
        bugsYscale,
        cellNutritionValue = 4,
        cellsAlive, // Number of cells alive
        cellSize = 1, // Width and heigth of a cell in pixels
        fillRatio = 20, // Percentage of available cells that will be set alive initially (20)
        dataCycle = 10,
        deadBugCells = [],
        deadBugs = [],

        graveRadius = 50,
        graveMultiplier = 10,
        gogogo = null,
        interval = 0, // Milliseconds between iterations
        liferules = [],
        maleCount = function () {
            return bugs.filter(function (value, i, bugs) {
                return value.gender == 1;
                // console.log(value, i, bugs);
            }).length;
        },
        femaleCount = function () {
            return bugs.length - maleCount();
        },
        liveCells = [], // Array with x,y coordinates of living cells
        minBugFat = 50,
        neighbours, // Array with neighbours count
        numberCells = spaceWidth * spaceHeight, // Number of available cells
        pi = Math.PI,
        prevSteps = 0,
        pregnancySteps = 100,
        running = false,
        showGraph = false,
        showData = true,
        showIds = false,
        spaceHeight = (canvas.height / cellSize),
        spaceWidth = (canvas.width / cellSize),
        speed = 0,
        speedHandle = null,
        startBugsCount = 11,
        startnumberLivecells = numberCells * fillRatio / 100,
        steps = 0, // Number of iterations / steps done
        walkers = [
            [[-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]], // up right
            [[1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]],   // down right
            [[0, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]],  // down left
            [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1]] // up left
        ],
        yScale = 5 * graphCanvas.height / numberCells; //Ratio to apply values on y-axis

    // Set some variables
    function initVariables() {
        spaceWidth = (canvas.width / cellSize);
        spaceHeight = (canvas.height / cellSize);
        numberCells = spaceWidth * spaceHeight;
        startnumberLivecells = numberCells * fillRatio / 100;
        cellsAlive = startnumberLivecells;
        yScale = 5 * graphCanvas.height / numberCells;
        bugsYscale = (maleCount() != Infinity) ? Math.floor(graphCanvas.height / maleCount()) : graphCanvas.height / 5;
        bugId = 1;
        liveCells = [];
        deadBugCells = [];
        deadBugs = [];
        neighbours = [];
        bugs = [];
        $bugData.find('tbody tr').remove();
        clearSpace();
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
        var xScale = 2;
        var scaledSteps = Math.round(steps / xScale);
        if (steps % xScale == 0) {
            var ctx = graphCanvas.getContext('2d');
            ctx.fillStyle = "rgb(128, 128, 0)";
            ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - cellsAlive * yScale, 1, 1);
            ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(128,0,0,0.3)" : "rgba(0,0,0)";
            ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - maleCount() * 2, 1, 1);
            ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(0,0,0)" : "rgba(0,0,128,0.3)";
            ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - femaleCount() * 2, 1, 1);
        }
    }

    // Calculate generations per second
    function calcSpeed() {
        speed = steps - prevSteps;
        prevSteps = steps;
    }

    // Update the counter
    function updateCellularData() {
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

    // alternate 0 and 1
    function alternateBit(bit) {
        return Math.abs(bit - 1);
    }

    // Change gender of a bug if only one gender remains
    function balanceGenders() {
        if (bugs[0] && (typeof bugs[0].gender !== 'undefined') && (maleCount() == 0 || femaleCount() == 0)) {
            // alternate 1 en 0
            bugs[0].gender = alternateBit(bugs[0].gender);
        }
    }

    // Draw the bugs
    function drawBugs() {
        function drawBug(bug) {
            var mouthWidth = pi / 4;
            ctx.fillStyle = bug.color();
            ctx.beginPath();
            ctx.arc(bug.x, bug.y, bug.radius * cellSize, bug.direction + mouthWidth, bug.direction - mouthWidth);
            ctx.fill();
            ctx.fillStyle = "rgb(255,255,255)";
            if (showData) {
                // show border when bouncing
                // if (bug.steps % bug.bounceSteps < bounceCycles) {
                //     ctx.strokeStyle = "rgba(255,255,255,0.9)";
                //     ctx.stroke();
                // }
                ctx.font = "10px Arial";
                ctx.fillText(bug.id, bug.x - 5, bug.y + 3);
            }
        }
        var ctx = canvas.getContext('2d');
        var thisBug;
        for (var i = 0; i < bugs.length; i++) {
            var thisBug = bugs[i];
            drawBug(thisBug);
        }
    }

    function moveBugs() {
        for (var i = 0; i < bugs.length; i++) {
            var thisBug = bugs[i];
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
        deadBugs = [];
        if (bugs.length > 1) {
            balanceGenders();
        }
    }

    function fixedDecimals(num, dec) {
        if (!dec) {
            dec = 2;
        }
        // decimals -> power
        var decimalFactor = Math.pow(10, dec);
        // return dec -> fraction digits
        return Math.round(num * decimalFactor) / decimalFactor;
    }

    function xWrap(x) {
        return (x + canvas.width) % canvas.width;
    }

    function yWrap(y) {
        return (y + canvas.height) % canvas.height;
    }

    function fatToRadius(fat) {
        return (fat > 0) ? Math.ceil(Math.sqrt(fat / (2 * pi))) : 0;
    }

    function randomSign() {
        return (Math.random() > Math.random()) ? 1 : -1;
    }

    function random01() {
        return Math.floor(Math.random() * 2);
    }

    function giveBirth(thisBug) {

        var partnerBug = bugs.filter(function (bug) {
            return bug.id === thisBug.partner;
        })[0];
        var center = {};
        var strongestBug;
        var weakestBug;
        var oldestBug;

        if (partnerBug) {
            partnerBug.offspring++;
            partnerBug.fat -= 2 * minBugFat;
            center = {
                x: xWrap(Math.round((thisBug.x + partnerBug.x) / 2)),
                y: yWrap(Math.round((thisBug.y + partnerBug.y) / 2))
            };
            strongestBug = (thisBug.fat > partnerBug.fat) ? thisBug : partnerBug;
            weakestBug = (thisBug.fat < partnerBug.fat) ? thisBug : partnerBug;
            oldestBug = (thisBug.generation > partnerBug.generation) ? thisBug : partnerBug;
        } else {
            center = {
                x: thisBug.x,
                y: thisBug.y
            }
            strongestBug = thisBug;
            weakestBug = thisBug;
            oldestBug = thisBug;
        }

        thisBug.offspring++;
        thisBug.fat -= 2 * minBugFat;
        thisBug.partner = null;
        thisBug.pregnant = false;
        thisBug.recoverySteps = 0;

        var newBornBug = new randomBug();

        newBornBug.generation = oldestBug.generation + 1;

        newBornBug.y = fixedDecimals(center.y + Math.cos(Math.random() * 2 * pi) * (Math.random() * 100 + strongestBug.radius));
        newBornBug.x = fixedDecimals(center.x + Math.cos(Math.random() * 2 * pi) * (Math.random() * 100 + strongestBug.radius));

        newBornBug.turnSteps = Math.abs(Math.round(strongestBug.turnSteps + randomSign() * weakestBug.turnSteps / 2));

        newBornBug.turnAmount = (strongestBug.turnAmount + randomSign() * Math.random() * weakestBug.turnAmount) % (pi * 2);

        newBornBug.poopFrequency = Math.round(strongestBug.poopFrequency + randomSign() * weakestBug.poopFrequency / 10);
        bugs.push(newBornBug);
    }

    // Let bugs avoid each other
    function avoidOrAttractOthers() {

        function approaching() {
            var dX = thisBug.x - thatBug.x;
            var dY = thisBug.y - thatBug.y;
            var distance = Math.sqrt(Math.pow((dX), 2) + Math.pow((dY), 2));
            var minDistance = thisBug.radius + thatBug.radius + 5;
            return distance < minDistance && bounceCycles >= thisBug.bounceSteps && thisBug.bounceSteps > 0;
        }

        function fullTerm() {
            return thisBug.gender == 0 && thisBug.recoverySteps >= pregnancySteps;
        }

        function lastAdultBug() {
            var lastBug = bugs[0];
            if (bugs.length == 1 && lastBug.adult()) {
                lastBug.gender = 0;
                return true;
            } else {
                return false;
            }
        }

        function differentGenders() {
            return thisBug.gender !== thatBug.gender;
        }

        function bothAdult() {
            return thisBug.adult() && thatBug.adult();
        }

        function timeToTurn() {
            return thisBug.steps % thisBug.turnSteps == 0 && bounceCycles >= thisBug.bounceSteps > 0;
        }

        function turn() {
            thisBug.direction += randomSign() * thisBug.turnAmount;
            // thatBug.direction = thisBug.direction % (2 * pi);
        }

        function startBounce() {
            if (thisBug.bounceSteps == bounceCycles) {
                console.log('startBounce');
                // exChanging directions
                thisBug.direction += pi / 2;
                // start countdown
                thisBug.bounceSteps--;
            }
        }

        function turnFaces() {
            var dX = thisBug.x - thatBug.x;
            var dY = thisBug.y - thatBug.y;
            var angle = thisBug.direction;
            if (Math.abs(dY) >= Math.abs(dX) && Math.abs(dX) > 0) {
                angle = Math.acos(dX / dY);
            } else {
                angle = Math.asin(dY / dX);
            }
            thisBug.direction = angle;
            thatBug.direction = angle + pi;
        }

        function fertilize() {
            if (thisBug.gender == 0) {
                thisBug.pregnant = true;
                thatBug.pregnant = false;
                thisBug.partner = thatBug.id;
            }
            if (thatBug.gender == 0) {
                thatBug.pregnant = true;
                thisBug.pregnant = false;
                thatBug.partner = thisBug.id;
            }
        }

        function fertile() {
            return differentGenders() && bothAdult();
        }

        for (var i = 0; i < bugs.length; i++) {
            var thisBug = bugs[i];
            if (lastAdultBug()) {
                // There's only one bugger left so it'd better reproduce.
                giveBirth(thisBug);
            } else {
                // There's more of them buggers
                for (var j = 0; j < bugs.length; j++) {
                    if (i !== j) {
                        var thatBug = bugs[j];
                        if (approaching()) {
                            if (fertile()) {
                                turnFaces();
                                fertilize();
                                if (fullTerm()) {
                                    giveBirth(thisBug);
                                }
                            } else {
                                // They're not fertile
                                startBounce();
                            }
                        } else {
                            // They're heading into open space
                            if (timeToTurn()) {
                                turn();
                            }
                        }
                    }
                }
            }
        }
    }

    // random bug object
    function randomBug() {
        return {
            adult: function () {
                return this.fat > adultFat;
            },
            alive: true,
            bounceSteps: bounceCycles,
            direction: Math.random() * 2 * pi,
            fat: 2 * minBugFat,
            gender: random01(),
            generation: 0,
            id: bugId++,
            maxRadius: 15,
            offspring: 0,
            partner: null,
            poopFrequency: Math.floor(Math.random() * 40 + 10),
            pregnant: false,
            radius: fatToRadius(this.remnantCells),
            recoverySteps: 0,
            remnantCells: minBugFat,
            steps: 0,
            turnAmount: Math.random() * pi / 2,
            turnDirection: randomSign,
            turnSteps: Math.round(Math.random() * 100),
            x: fixedDecimals((Math.random() * spaceWidth) * cellSize, 2),
            y: fixedDecimals((Math.random() * spaceHeight) * cellSize, 2),
            color: function () {
                var rgbVal;
                if (this.gender == 1) {
                    if (this.adult()) {
                        rgbVal = "255,77,77,0.7";
                    } else {
                        rgbVal = "128,0,0,0.7";
                    }
                } else {
                    if (this.adult()) {
                        rgbVal = "64,64,255,0.7";
                    } else {
                        rgbVal = "0,0,128,0.7";
                    }
                }
                return "rgba(" + rgbVal + ")";
            },
            move: function () {
                if (this.fat < this.remnantCells) {
                    this.alive = false;
                } else {
                    this.x = fixedDecimals(xWrap(this.x + Math.cos(this.direction)));
                    this.y = fixedDecimals(yWrap(this.y + Math.sin(this.direction)));
                    this.fat -= Math.log10(this.fat) / 2;
                    this.radius = Math.min(fatToRadius(this.fat), this.maxRadius);
                    this.steps++;
                    this.recoverySteps += (this.pregnant) ? 1 : 0;
                    this.bounceSteps = (bounceCycles > this.bounceSteps && this.bounceSteps > 0) ? this.bounceSteps - 1 : bounceCycles;
                    if (this.steps % this.poopFrequency == 0) {
                        this.poop();
                    }
                }
            },
            feed: function () {
                if (this.alive) {
                    this.fat += cellNutritionValue;
                    // if (this.steps % this.turnSteps == 0) {
                    this.direction = (this.direction + this.turnDirection() * this.turnAmount) % (pi * 2);
                    // }
                }
            },
            poop: function () {
                var self = this,
                    poo = {},
                    pooDirection = Math.abs(Math.round((4 * ((this.direction + 2.5 * pi) % (2 * pi)) - pi) / 2 / pi)),
                    cells = [];
                // console.log(pooDirection);
                poo.x = Math.round(Math.cos(this.direction + pi) * (this.radius + 2) + self.x);
                poo.y = Math.round(Math.sin(this.direction + pi) * (this.radius + 2) + self.y);
                cells = $.extend(true, {}, walkers[pooDirection]); // deep copy
                for (var key in cells) {
                    if (cells.hasOwnProperty(key)) {
                        var cell = cells[key];
                        cell[0] = xWrap(cell[0] + poo.x);
                        cell[1] = yWrap(cell[1] + poo.y);
                        deadBugCells.push(new celXY(cell[0], cell[1]));
                    }
                }
            },
            die: function () {
                var r, angle, x, y;
                for (var i = this.fat * graveMultiplier; i > 0; i--) {
                    r = Math.random() * graveRadius + this.maxRadius;
                    angle = Math.random() * 2 * pi;
                    x = xWrap(this.radius + Math.round(this.x + Math.cos(angle) * r));
                    y = yWrap(this.radius + Math.round(this.y + Math.sin(angle) * r));
                    deadBugCells.push(new celXY(x, y));
                }
                this.fat = 0;
            }
        }
    }

    function addBugs(amount) {
        for (var count = 0; count < amount; count++) {
            bugs.push(randomBug());
        }
    }

    function addDeadBugCells() {
        if (deadBugCells.length) {
            liveCells = liveCells.concat(deadBugCells);
            deadBugCells = [];
        }
    }

    function updateScreen() {
        fadeCells();
        drawCells();
        if (steps % dataCycle == 0) {
            updateCellularData();
            if (showData) {
                showDataTable();
            }
        }
        drawBugs();
        if (showGraph) {
            drawGraph();
        }
        if (steps % canvas.width == 0) {
            fadeGraph();
        }
    }

    // Animation function
    function bugLifeStep() {
        steps += 1;
        addDeadBugCells();
        zeroNeighbours();
        countNeighbours();
        evalNeighbours();
        avoidOrAttractOthers();
        moveBugs();
        updateScreen();
    }

    function firstStep() {
        if (canvas.getContext) {
            initVariables();
            initLiferules();
            fillRandom();
            addBugs(startBugsCount);
            updateScreen();
        } else {
            // canvas-unsupported code here
            document.write("If you see this, you&rsquo;d better install Firefox or Chrome or Opera or Safari or &hellip;");
        }
    }

    // Do one life step
    function steplife() {
        bugLifeStep();
    }
    $('#stepbutton').on('click', function () {
        steplife();
    });
    shortcut.add("right", function () {
        steplife();
    });

    function setIntervals() {
        gogogo = setInterval(bugLifeStep, interval);
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

    // stop and startlife (with new interval)
    function stopStartLife() {
        stopLife();
        startLife();
    }
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
        updateCellularData();
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

    // Toggle bug data on or off
    if (showData) {
        $('#bugData').show();
    } else {
        $('#bugData').hide();
    }
    $('#datatoggler').on('click', function () {
        showData = !showData;
        $('#bugData').toggle('slow');
    });

    $('#liferules input').on('click', function () {
        initLiferules();
    });

    $('canvas').on('mouseover', function () {
        showIds = true;
        interval = 250;
        dataCycle = 1;
        stopStartLife();
    });

    $('canvas').on('mouseout', function () {
        showIds = false;
        interval = 0;
        dataCycle = 10;
        stopStartLife();
    });

    // Fill livecells with your own mouse drawing
    $('#thetoroid').on('click', function (event) {
        mouseX = Math.floor((event.offsetX ? (event.offsetX) : event.pageX - this.offsetLeft) / cellSize);
        mouseY = Math.floor((event.offsetY ? (event.offsetY) : event.pageY - this.offsetTop) / cellSize);
        liveCells.push(new celXY(mouseX, mouseY));
        drawCells();
        updateCellularData();
    });

    // init cellNutritionValue;
    $cellNutritionValue.val(cellNutritionValue);
    // Life cell nutrition value updaten
    $cellNutritionValue.on('change', function () {
        cellNutritionValue = parseInt($cellNutritionValue.val());
    });

    // Uit object halen?
    function showDataTable() {
        $('#bugCount').text(bugs.length);
        for (var i = 0; i < bugs.length; i++) {
            var thisBug = bugs[i];
            var $oldTr = $bugData.find('tr#bug' + thisBug.id);
            if (thisBug.alive) {
                var $tr = $('<tr style="color:' + thisBug.color() + ';" id="bug' + thisBug.id + '"></tr>');
                $tr.append('<td>' + (thisBug.id + '').substr(-4) + '</td>');
                $tr.append('<td>' + thisBug.gender + '</td>');
                $tr.append('<td>' + Math.round(thisBug.fat) + '</td>');
                // $tr.append('<td>' + thisBug.radius + '</td>');
                // $tr.append('<td>' + thisBug.direction + '</td>');
                // $tr.append('<td>' + this.x + '</td>');
                // $tr.append('<td>' + this.y + '</td>');
                // $tr.append('<td>' + fixedDecimals(this.direction / pi, 2) + '</td>');
                // $tr.append('<td>' + fixedDecimals(thisBug.bounceSteps) + '</td>');
                $tr.append('<td>' + fixedDecimals(thisBug.turnAmount) + '</td>');
                $tr.append('<td>' + fixedDecimals(thisBug.turnSteps) + '</td>');
                $tr.append('<td>' + thisBug.offspring + '</td>');
                $tr.append('<td>' + thisBug.generation + '</td>');
                if ($oldTr.length) {
                    $oldTr.replaceWith($tr)
                } else {
                    $bugData.append($tr);
                }
            } else {
                $oldTr.remove();
            }
        }
        $.each($bugData.find('tr[id^="bug"]'), function () {
            var thisTr = this;
            function idMatch(bug) {
                return 'bug' + bug.id == thisTr.id;
            }
            if (!bugs.find(idMatch)) {
                this.remove();
            }
        });
    }

    firstStep();
    if (running === false) {
        startLife();
    }

});	
