$(function () {

    var canvas = document.getElementById('thetoroid'), // The canvas where life is drawn
        graphCanvas = document.getElementById('thegraph'), // The canvas where the graph is drawn

        $flockingDistance = $('.flockingDistance'),
        $repellingDistance = $('.repellingDistance'),
        $teller = $('#teller'),
        $cellsAlive = $('#cellsalive'),
        $speed = $('#speed'),
        $startBugCount = $('.startBugCount'),
        $bugCount = $('#bugCount'),
        $bugData = $('#bugData table'),
        $cellNutritionValue = $('.cellNutrition'),
        bugImages = [
            [$('.bug-0')[0], $('.bug_0')[0]],
            [$('.bug-1')[0], $('.bug_1')[0]]
        ],

        adultFat = 1500,
        bounceCycles = 30,
        bugId = 1,
        bugs = [],
        bugsYscale,
        cellNutritionValue = 3,
        cellsAlive, // Number of cells alive
        cellSize = 1, // Width and heigth of a cell in pixels
        feromoneRange = 150,
        fillRatio = 20, // Percentage of available cells that will be set alive initially (20)
        flocking = $('.flock').is(":checked"),
        flockGravityPoint = [],
        dataCycle = 10,
        deadBugCells = [],
        deadBugs = [],
        graveRadius = 50,
        graveMultiplier = 10,
        gogogo = null,
        interval = 0, // Milliseconds between iterations
        liferules = [],
        liveCells = [], // Array with x,y coordinates of living cells
        flockingDistance = 50, // this.flockingDistance;
        repellingDistance = 5,
        minBugFat = 100,
        neighbours, // Array with neighbours count
        newBornSteps = 500,
        numberCells = spaceWidth * spaceHeight, // Number of available cells
        pi = Math.PI,
        prevSteps = 0,
        pregnancySteps = 100,
        running = false,
        showGraph = false,
        showData = false,
        showIds = false,
        spaceHeight = (canvas.height / cellSize),
        spaceWidth = (canvas.width / cellSize),
        speed = 0,
        speedHandle = null,
        startBugsCount = 17,
        startnumberLivecells = numberCells * fillRatio / 100,
        lifeSteps = 0, // Number of iterations / steps done
        maxBugSteps = 10000,
        walkers = [],
        xScale = 2, // x scale of graph
        yScale = 5 * graphCanvas.height / numberCells; //Ratio to apply values on y-axis

    function maleCount() {
        return bugs.filter(function (value, i, bugs) {
            return value.gender == 1;
            // console.log(value, i, bugs);
        }).length;
    }

    function femaleCount() {
        return bugs.length - maleCount();
    }

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
        walkers = [
            [[1, -2], [2, -1], [-2, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1]], // right
            [[1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]],   // down right
            [[0, -2], [-1, -1], [-1, 0], [-1, 1], [2, 1], [-1, 2], [0, 2], [1, 2]], // down
            [[0, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]],  // down left
            [[-1, -2], [-2, -1], [-2, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1]], // left
            [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1]], // up left
            [[-1, -2], [0, -2], [1, -2], [-1, -1], [2, -1], [-1, 0], [-1, 1], [0, 2]], // up
            [[-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]], // up right
        ];
        $bugData.find('tbody tr').remove();
        clearSpace();
    }

    function initLiferules() {
        var lifeSteps = 0;
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

    // Bind inputs for bug rules
    function initBugrules() {
        // init startBugCount;
        $startBugCount.val(startBugsCount);
        // startBugCount updaten
        $startBugCount.on('change', function () {
            startBugsCount = parseInt($startBugCount.val());
        });
        $flockingDistance.val();
        $flockingDistance.on('change', function () {
            flockingDistance = parseInt($flockingDistance.val());
        });
        $repellingDistance.val();
        $repellingDistance.on('change', function () {
            repellingDistance = parseInt($repellingDistance.val());
        });

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
        var scaledSteps = Math.round(lifeSteps / xScale);
        if (lifeSteps % xScale == 0) {
            var ctx = graphCanvas.getContext('2d');
            ctx.fillStyle = "rgb(128, 128, 0)";
            ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - cellsAlive * yScale, 1, 1);
            ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(128,0,0,0.3)" : "rgba(0,0,0)";
            ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - maleCount() * 5, 1, 1);
            ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(0,0,0)" : "rgba(0,0,128,0.3)";
            ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - femaleCount() * 5, 1, 1);
        }
    }

    // Calculate generations per second
    function calcSpeed() {
        speed = lifeSteps - prevSteps;
        prevSteps = lifeSteps;
    }

    // Update the counter
    function updateCellularData() {
        $teller.text(lifeSteps);
        $cellsAlive.text(cellsAlive);
        $speed.text(speed);
        $bugCount.text(bugs.length);
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
        function whichSide(x, y, bug) {
            // todo this is not correct
            var movingToRight = Math.cos(bug.direction) > 0;
            var bugAxis = Math.tan(bug.direction) * x + bug.y;
            if (movingToRight) {
                return y > bugAxis; // food was on the right side of bug if true
            } else {
                return y < bugAxis; // food was on the right side of bug if true
            }
        }
        for (var count in bugs) {
            thisBug = bugs[count];
            if (inCircle(x, y, thisBug)) {
                thisBug.feed(whichSide(x, y, thisBug));
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
            var adult = (bug.adult()) ? 1 : 0;
            var image = bugImages[bug.gender][adult];
            var scale = Math.max(bug.radius, bug.minRadius) / 16;
            ctx.translate(bug.x, bug.y);
            ctx.rotate(bug.direction - pi / 2);
            ctx.scale(scale, scale);
            ctx.drawImage(image, - 16, - 16);
            ctx.fillStyle = "rgb(0,0,0)";
            if (showData) {
                ctx.fillText(bug.id, - 6, - 2);
            }
        }
        var ctx = canvas.getContext('2d');
        var thisBug;
        for (var i = 0; i < bugs.length; i++) {
            thisBug = bugs[i];
            ctx.save();
            drawBug(thisBug);
            ctx.restore();
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
        for (var j = deadBugs.length - 1; j > 0; j--) {
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

        thisBug.action = 'giving birth';

        var partnerBug = bugs.filter(function (bug) {
            return bug.id === thisBug.partner;
        })[0];
        var strongestBug;
        var weakestBug;
        var oldestBug;

        if (partnerBug) {
            partnerBug.offspring++;
            partnerBug.fat -= 2 * minBugFat;
            strongestBug = (thisBug.fat > partnerBug.fat) ? thisBug : partnerBug;
            weakestBug = (thisBug.fat < partnerBug.fat) ? thisBug : partnerBug;
            oldestBug = (thisBug.generation > partnerBug.generation) ? thisBug : partnerBug;
        } else {
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
        newBornBug.parentId = (thisBug.gender == 0) ? thisBug.id : partnerBug.id;
        newBornBug.generation = oldestBug.generation + 1;

        newBornBug.y = fixedDecimals(thisBug.y + Math.sin(thisBug.direction + randomSign() * pi / 2) * (Math.random() * 50 + thisBug.radius));
        newBornBug.x = fixedDecimals(thisBug.x + Math.cos(thisBug.direction + randomSign() * pi / 2) * (Math.random() * 50 + thisBug.radius));

        newBornBug.turnSteps = Math.abs(Math.round(strongestBug.turnSteps + randomSign() * weakestBug.turnSteps / 10));

        newBornBug.turnAmount = (strongestBug.turnAmount + randomSign() * Math.random() * weakestBug.turnAmount / 10) % (pi * 2);

        newBornBug.poopSteps = Math.round(strongestBug.poopSteps + randomSign() * weakestBug.poopSteps / 10);

        bugs.push(newBornBug);
    }

    // If parent exists return part of its fat
    function parent(momId) {
        var motherBug = $.grep(bugs, function (bug) { return bug.id == momId; });
        if (motherBug.length) {
            return motherBug[0];
        } else {
            return null;
        }
    }

    function calcDistance(thisBug, thatBug) {
        var dX = thisBug.x - thatBug.x;
        var dY = thisBug.y - thatBug.y;
        var distance = Math.sqrt(Math.pow((dX), 2) + Math.pow((dY), 2));
        return distance;
    }

    function inFront(thisBug, thatBug) {
        var perpendicularDirection = thisBug.direction - pi / 2;
        return thatBug.y > thatBug.x * Math.sin(perpendicularDirection);
    }

    function positiveAngle(angle) {
        return (angle + 4 * pi) % (2 * pi);
    }

    function calcAngle(bug, pos) {
        var dX = pos[0] - bug.x;
        var dY = pos[1] - bug.y;
        var angle = Math.atan2(dY, dX);
        return angle;
    }

    // change bug direction towards given direction a bit
    function nudge(bug, direction) {
        var tempDirection = positiveAngle(direction - bug.direction);
        var nudgeAngle = pi / 32;
        if (tempDirection > pi) {
            bug.direction -= nudgeAngle;
        } else {
            bug.direction += nudgeAngle;
        }
        bug.direction = positiveAngle(bug.direction);
    }

    function diverge(bug, closeBugs) {
        bug.action = 'diverge';
        var xTotal = 0;
        var yTotal = 0;
        var meanPos = [];
        var bugCount = closeBugs.length;
        var bugsInfront = false;
        for (var i = 0; i < bugCount; i++) {
            var thisBug = closeBugs[i];
            if (inFront(bug, thisBug)) {
                bugsInfront = true;
                xTotal += thisBug.x;
                yTotal += thisBug.y;
            }
        }
        if (bugsInfront) {
            meanPos[0] = xTotal / bugCount;
            meanPos[1] = yTotal / bugCount;
            var directionToMeanPos = calcAngle(bug, meanPos);
            nudge(bug, directionToMeanPos - pi);
        }
    }

    function inConvergingRange(thisBug, thatBug) {
        var distance = calcDistance(thisBug, thatBug);
        var inRange = distance < flockingDistance;
        return inRange;
    }

    function notSameBug(thisBug, thatBug) {
        return thisBug.id !== thatBug.id;
    }

    function converge(bug) {
        if (bugs.length > 1) {
            bug.action = 'converge';
            var convergingPointDistance = 50; // Make variable input
            var xTotal = 0;
            var yTotal = 0;
            var sinTotal = 0;
            var cosTotal = 0;
            var meanPos = [];
            var targetPoint = [];
            var direction = 0;
            var bugCount = bugs.length;
            var doConverge = false;
            for (var i = 0; i < bugCount; i++) {
                var thisBug = bugs[i];
                if (notSameBug(thisBug, bug) && inConvergingRange(bug, thisBug)) {
                    doConverge = true;
                    // get vector of thisBug
                    xTotal += thisBug.x;
                    yTotal += thisBug.y;
                    cosTotal += Math.cos(thisBug.direction);
                    sinTotal += Math.sin(thisBug.direction);
                }
            }
            if (doConverge) {
                meanPos[0] = xTotal / (bugCount - 1);
                meanPos[1] = yTotal / (bugCount - 1);
                var meanDirection = Math.atan2(sinTotal, cosTotal);

                targetPoint[0] = meanPos[0] + cosTotal * convergingPointDistance;
                targetPoint[1] = meanPos[1] + sinTotal * convergingPointDistance;
                var directionToTargetPos = calcAngle(bug, targetPoint);

                nudge(bug, directionToTargetPos);
            }

        }
    }

    function watchForCloseBugs(bug) {
        var bugCount = bugs.length;
        var closeBugs = [];
        for (var i = 0; i < bugCount; i++) {
            var thisBug = bugs[i];
            if (notSameBug(thisBug, bug)) {
                var minDistance = bug.radius + thisBug.radius + repellingDistance;
                var distance = calcDistance(bug, thisBug);
                if (distance < minDistance) {
                    closeBugs.push(thisBug);
                }
            }
        }
        return closeBugs;
    }

    function differentGenders(thisBug, thatBug) {
        return thisBug.gender !== thatBug.gender;
    }

    function bothAdult(thisBug, thatBug) {
        return thisBug.adult() && thatBug.adult() && !thisBug.pregnant && !thatBug.pregnant;
    }

    function fertile(thisBug, thatBug) {
        return differentGenders(thisBug, thatBug) && bothAdult(thisBug, thatBug) && !thisBug.pregnant && bugs.length < 23;
    }

    function together(thisBug, thatBug) {
        var minDistance = thisBug.radius + thatBug.radius;
        var distance = calcDistance(thisBug, thatBug);
        return distance < minDistance;
    }

    function fullTerm(thisBug) {
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

    function fertilize(thisBug, thatBug) {
        thisBug.action = 'mating';

        if (thisBug.gender == 0) {
            thisBug.pregnant = true;
            thisBug.partner = thatBug.id;
        }
        if (thatBug.gender == 0) {
            thatBug.pregnant = true;
            thatBug.partner = thisBug.id;
        }
    }

    function canMate(bug) {
        var closestCandidatePartner = null;
        if (bug.adult()) {
            var bugCount = bugs.length;
            var closestDistance = Infinity;
            for (var i = 0; i < bugCount; i++) {
                var thisBug = bugs[i];
                if (fertile(bug, thisBug)) {
                    var distance = calcDistance(bug, thisBug);
                    if (distance < closestDistance) {
                        closestCandidatePartner = thisBug;
                    }
                }
            }
        }
        return closestCandidatePartner;
    }

    function headForPartner(thisBug, thatBug) {
        thisBug.action = 'head for ' + thatBug.id;
        var candidatePos = [thatBug.x, thatBug.y];
        var candidateDirection = calcAngle(thisBug, candidatePos);
        nudge(thisBug, candidateDirection);
    }

    function navigate(bug) {
        if (fullTerm(bug) || lastAdultBug()) {
            giveBirth(bug);
        } else {
            var candidate = canMate(bug);
            if (candidate) {
                if (together(bug, candidate)) {
                    fertilize(bug, candidate);
                } else {
                    headForPartner(bug, candidate);
                }
            } else {
                var parent = bug.needsParent();
                if (parent) {
                    bug.feedOnParent();
                } else {
                    var tooCloseBugs = watchForCloseBugs(bug);
                    if (tooCloseBugs.length > 0) {
                        diverge(bug, tooCloseBugs);
                    } else {
                        if (bug.timeToTurn()) {
                            bug.reactToFood();
                        } else {
                            if (flocking) converge(bug);
                        }
                    }
                }
            }
        }
    }

    // random bug object
    function randomBug() {
        return {
            alive: true,
            goldenRatio: 1.618,
            maxRadius: 15,
            minRadius: Math.ceil(Math.random() * 7),
            fat: 4 * minBugFat,
            direction: Math.random() * 2 * pi,
            goal: 'none',
            flockSteps: 10 + Math.ceil(Math.random() * 25),
            poopSteps: Math.ceil(Math.random() * 40 + 10),
            turnSteps: Math.ceil(Math.random() * 100),
            foodLeft: 0,
            foodRight: 0,
            gender: random01(),
            generation: 0,
            id: bugId++,
            remnantCells: minBugFat,
            radius: fatToRadius(this.remnantCells),
            parentId: null,
            partner: null,
            pregnant: false,
            maxSteps: maxBugSteps + randomSign() * Math.random() * 1000,
            recoverySteps: 0,
            steps: 0,
            offspring: 0,
            turnAmount: Math.random() * pi / 4,
            turnDirection: randomSign,
            x: fixedDecimals((Math.random() * spaceWidth) * cellSize, 2),
            y: fixedDecimals((Math.random() * spaceHeight) * cellSize, 2),
            adultRadius: function () {
                return this.maxRadius / this.goldenRatio;
            },
            adult: function () {
                return this.radius > this.adultRadius();
            },
            getRadius: function () {
                var newRadius = Math.sqrt(Math.pow(this.maxSteps / 2, 2) - Math.pow(this.steps - this.maxSteps / 2, 2)) * 2 * this.maxRadius / this.maxSteps;
                return newRadius;
            },
            timeToTurn: function () {
                return this.steps % this.turnSteps == 0;
            },
            timeToFlock: function () {
                return flocking && this.steps % this.flockSteps == 0;
            },
            reactToFood: function () {
                if (this.foodLeft !== this.foodRight) {
                    var right = this.foodRight > this.foodLeft;
                    this.action = (right) ? 'food right' : 'food left';
                    this.turn(right);
                    this.foodRight = 0;
                    this.foodLeft = 0;
                }
            },
            needsParent: function () {
                if (this.steps < this.newBornSteps) {
                    return this.parentId;
                }
                return null;
            },
            turn: function (right) {
                var sign = (right) ? 1 : -1;
                this.direction += (sign * this.turnAmount);
                this.direction = positiveAngle(this.direction);
            },
            advance: function () {
                this.x = fixedDecimals(xWrap(this.x + Math.cos(this.direction)));
                this.y = fixedDecimals(yWrap(this.y + Math.sin(this.direction)));
            },
            digest: function () {
                if (this.fat > minBugFat) {
                    this.fat -= Math.ceil(Math.log10(this.fat) / 3);
                    this.radius = this.getRadius();
                } else {
                    this.alive = false;
                }
                // this.radius = Math.min(fatToRadius(this.fat), this.maxRadius);
                // this.radius = Math.max(this.radius, this.minRadius);
            },
            feedOnParent: function () {
                this.action = 'parent';
                var parentBug = parent(this.parentId);
                if (parentBug) {
                    parentBug.fat--;
                    this.fat++;
                    this.direction = parentBug.direction;
                }
            },
            move: function () {
                this.steps++;
                navigate(this);
                this.advance();
                this.digest();
                this.recoverySteps += (this.pregnant) ? 1 : 0;
                if (this.steps % this.poopSteps == 0) {
                    this.poop();
                }
                if (this.radius < 1 && this.steps > 100) {
                    this.alive = false;
                }
            },
            feed: function (right) {
                if (this.alive) {
                    if (right) {
                        this.foodRight++;
                    } else {
                        this.foodLeft++;
                    }
                    this.fat += cellNutritionValue;
                }
            },
            poop: function () {
                var self = this,
                    poo = {},
                    // determine glider with opposite direction of bug
                    pooDirection = Math.round(((this.direction + pi) % (2 * pi)) / pi * 4) % 8;
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
        };
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
        if (lifeSteps % dataCycle == 0) {
            updateCellularData();
            if (showData) {
                showDataTable();
            }
        }
        drawBugs();
        if (showGraph) {
            drawGraph();
        }
        if (lifeSteps % (canvas.width * xScale) == 0) {
            fadeGraph();
        }
    }

    // Animation function
    function bugLifeStep() {
        lifeSteps += 1;
        addDeadBugCells();
        zeroNeighbours();
        countNeighbours();
        evalNeighbours();
        moveBugs();
        updateScreen();
    }

    function firstStep() {
        if (canvas.getContext) {
            initVariables();
            initLiferules();
            initBugrules();
            fillRandom();
            addBugs(startBugsCount);
            updateScreen();
        } else {
            // canvas-unsupported code here
            $('.noCanvas').show();
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

    // Flocking switch
    $('.flock').on('click', function () {
        flocking = $('.flock').is(":checked");
    });

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
        lifeSteps = 0;
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
        lifeSteps = 0;
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
    shortcut.add("caps_lock", function () {
        $('.trails').click();
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
    $('#liferulestoggler').on('click', function () {
        $('#liferules').toggle('slow');
    });

    // Toggle bugrules checkboxes on or off
    $('#bugrulestoggler').on('click', function () {
        $('#bugrules').toggle('slow');
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

    $('#bugrules input').on('click', function () {
        initBugrules();
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
        function color(thisBug) {
            var rgbVal;
            if (thisBug.gender == 1) {
                if (thisBug.adult()) {
                    rgbVal = "193,39,45,0.7";
                } else {
                    rgbVal = "193,0,0,0.7";
                }
            } else {
                if (thisBug.adult()) {
                    rgbVal = "0,113,188,0.7";
                } else {
                    rgbVal = "0,0,188,0.7";
                }
            }
            return "rgba(" + rgbVal + ")";
        }

        $bugCount.text(bugs.length);
        for (var i = 0; i < bugs.length; i++) {
            var thisBug = bugs[i];
            var $oldTr = $bugData.find('tr#bug' + thisBug.id);
            if (thisBug.alive) {
                var $tr = $('<tr style="color:' + color(thisBug) + ';" id="bug' + thisBug.id + '"></tr>');
                $tr.append('<td>' + (thisBug.id + '').substr(-4) + '</td>');
                // $tr.append('<td>' + thisBug.gender + '</td>');
                $tr.append('<td>' + Math.round(thisBug.fat) + '</td>');
                // $tr.append('<td>' + thisBug.radius + '</td>');
                // $tr.append('<td>' + thisBug.direction + '</td>');
                // $tr.append('<td>' + thisBug.x + '</td>');
                // $tr.append('<td>' + thisBug.y + '</td>');
                $tr.append('<td>' + fixedDecimals(thisBug.direction / pi, 2) + '</td>');
                // $tr.append('<td>' + fixedDecimals(thisBug.bounceSteps) + '</td>');
                // $tr.append('<td>' + fixedDecimals(thisBug.recoverySteps) + '</td>');
                $tr.append('<td>' + fixedDecimals(thisBug.turnAmount) + '</td>');
                $tr.append('<td>' + fixedDecimals(thisBug.turnSteps) + '</td>');
                $tr.append('<td>' + fixedDecimals(thisBug.poopSteps) + '</td>');
                $tr.append('<td>' + thisBug.offspring + '</td>');
                $tr.append('<td>' + thisBug.generation + '</td>');
                $tr.append('<td>' + thisBug.action + '</td>');
                if ($oldTr.length) {
                    $oldTr.replaceWith($tr);
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
